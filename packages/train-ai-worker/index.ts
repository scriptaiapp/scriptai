import { Worker } from 'bullmq';
import { createSupabaseClient, getSupabaseEnv, SupabaseClient } from '@repo/supabase';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TrainAIJob {
  videoUrl: string;
  userId: string;
  task: 'test' | 'trim' | 'transcode';  // Extensible for sub-tasks
}

// Shared Supabase (DRY)
const { url, key } = getSupabaseEnv();
const supabase: SupabaseClient = createSupabaseClient(url, key);

// Worker: Listens to 'train-ai-queue'
const worker = new Worker<TrainAIJob>(
  'train-ai-queue',  // Queue name (specific to train-ai)
  async (job) => {
    const { videoUrl, userId, task } = job.data;
    console.log(`Processing train-ai job ${job.id} for user ${userId}: ${task}`);

    try {
      let result: string;
      if (task === 'test') {
        // Dummy test: Just echo
        result = 'Test completed: Hello train-ai!';
      } else {
        // Real FFmpeg (e.g., trim 10s)
        const output = `/tmp/output_${job.id}.mp4`;
        await execAsync(`${ffmpegPath} -i ${videoUrl} -t 10 -c copy ${output}`);
        result = output;
      }

      // Store result in Supabase (e.g., jobs table)
      const { error } = await supabase
        .from('train_ai_jobs')  // Create this table in Supabase
        .insert({ user_id: userId, job_id: job.id, status: 'completed', result });

      if (error) throw new Error(`DB insert failed: ${error.message}`);

      console.log(`Job ${job.id} done: ${result}`);
      return { status: 'success', result };  // Return for queue tracking
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      throw error;  // BullMQ auto-retries (up to 3x)
    }
  },
  {
    connection: { host: 'localhost', port: 6379 },  // Use REDIS_URL in prod
  }
);

// Events (scalable: Log/notify on complete/fail)
worker.on('completed', (job) => console.log(`Train-AI Job ${job.id} done`));
worker.on('failed', (job, err) => console.log(`Train-AI Job ${job.id} failed: ${err.message}`));

// Keep running
process.on('SIGINT', () => worker.close().then(() => process.exit(0)));