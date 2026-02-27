import { Controller, Get, Post, Body, ParseBoolPipe, Query, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { YoutubeService } from './youtube.service';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';
import { getUserId } from '../common/get-user-id';

@Controller('youtube')
@UseGuards(SupabaseAuthGuard)
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) { }

  @Get('video-metadata')
  getVideoMetadata(@Query('videoUrl') videoUrl: string) {
    return this.youtubeService.getVideoMetadata(videoUrl);
  }

  @Get('channel-videos')
  getChannelVideos(
    @Req() req: AuthRequest,
    @Query('pageToken') pageToken?: string,
    @Query('maxResults') maxResults?: string,
  ) {
    const userId = getUserId(req);
    return this.youtubeService.getChannelVideos(
      userId,
      pageToken,
      maxResults ? Math.min(parseInt(maxResults, 10), 24) : 6,
    );
  }

  @Get('trained-videos')
  getTrainedVideos(@Req() req: AuthRequest) {
    const userId = getUserId(req);
    return this.youtubeService.getTrainedVideos(userId);
  }

  @Post('trained-videos')
  saveTrainedVideos(@Req() req: AuthRequest, @Body() data: any) {
    const userId = getUserId(req);
    return this.youtubeService.saveTrainedVideos(userId, data.videos);
  }

  @Get('channel-stats')
  getChannelStats(@Req() req: AuthRequest, @Query('forceSync', ParseBoolPipe) forceSync?: boolean) {
    const userId = getUserId(req);
    return this.youtubeService.getChannelStats(userId, forceSync);
  }
}
