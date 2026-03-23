-- Add cross-feature FK columns to link ideation, scripts, thumbnails, and subtitles

-- scripts → ideation_jobs
ALTER TABLE public.scripts
  ADD COLUMN IF NOT EXISTS ideation_id UUID REFERENCES public.ideation_jobs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_scripts_ideation_id ON public.scripts(ideation_id)
  WHERE ideation_id IS NOT NULL;

-- thumbnail_jobs → scripts
ALTER TABLE public.thumbnail_jobs
  ADD COLUMN IF NOT EXISTS script_id UUID REFERENCES public.scripts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_thumbnail_jobs_script_id ON public.thumbnail_jobs(script_id)
  WHERE script_id IS NOT NULL;

-- thumbnail_jobs → story_builder_jobs
ALTER TABLE public.thumbnail_jobs
  ADD COLUMN IF NOT EXISTS story_builder_id UUID REFERENCES public.story_builder_jobs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_thumbnail_jobs_story_builder_id ON public.thumbnail_jobs(story_builder_id)
  WHERE story_builder_id IS NOT NULL;

-- subtitle_jobs → scripts
ALTER TABLE public.subtitle_jobs
  ADD COLUMN IF NOT EXISTS script_id UUID REFERENCES public.scripts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_subtitle_jobs_script_id ON public.subtitle_jobs(script_id)
  WHERE script_id IS NOT NULL;
