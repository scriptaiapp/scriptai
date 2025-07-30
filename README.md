# Script AI: Your Personal AI Content Assistant

## Overview

Script AI is a personalized AI content assistant that understands you, evolves with your channel, and helps you create more, better, faster. It empowers YouTube creators to focus on content creation rather than structure, saving hours and boosting creative confidence.

## Table of Contents

- Features
- Future Features
- Tech Stack
- Project Structure
- Development Guide
- Contributing

## Features

- **YouTube Channel Connection**: Link your channel.
- **Personalized AI Training**: Upload 3–5 videos to train a custom AI model for your style and language.
- **Script Generation**: Input a topic and context to generate personalized scripts or let AI modify your existing drafted script.
- **Topic Research**: Adds relevant links/stats from web or uploaded PDFs or let AI do the research for you.
- **Thumbnail Generator**: Creates thumbnails based on your past thumbnail style.
- **Course Module**: Dedicated feature specially for educators to create a complete course module, playlist for a particular topic.
- **Subtitle Generator**: Creates multi-language, editable subtitles for your videos.
- **Audio Translation**: Generates audio in multiple languages in your own voice using generative voice cloning (e.g., ElevenLabs), removing language barriers and letting your videos reach a global audience.
- **Credit System**: Earn credits via referrals to unlock premium features.

## Future Features

- **AI Video Generator**: Create AI-generated videos, reels like Sora, Veo.
- **Multi-Platform**: Expand same features for platforms like TikTok, Instagram Reels, or podcasts.
- **Collaboration Mode**: Real-time collaboration for teams.
- **Advanced Personalization**: Train AI with custom fine-tuned model.
- **Monetization Marketplace**: Buy/sell scripts or hire writers.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Shadcn, Aceternity UI, Supabase Auth
- **Backend**: NestJS
- **Database**: Supabase (PostgreSQL, cloud-based)
- **Payment**: Stripe
- **Deployment**: Vercel

## Project Structure

```
script-ai/
├── apps/
│   ├── web/                # Next.js frontend
│   │   ├── components/     # React components
│   │   ├── pages/          # Next.js pages
│   │   ├── styles/         # Tailwind and custom styles
│   │   └── lib/            # Supabase auth and API utilities
│   ├── api/                # NestJS backend
│   │   ├── src/            # Backend logic
│   │   ├── controllers/    # API endpoints
│   │   ├── services/       # AI and business logic
│   │   └── modules/        # Feature modules (e.g., script generation)
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── config/             # ESLint, TypeScript configs
│   └── utils/              # Shared utilities
├── scripts/                # Build and deployment scripts
├── turbo.json              # TurboRepo config
├── package.json            # Root package.json
└── README.md               # Project docs
```

## Development Guide

### Prerequisites

- **Node.js**: 18.x or higher
- **pnpm**: Package manager

### Setup

1. **Clone the Repository**:

   ```
   git clone https://github.com/afrinxnahar/scriptai
   cd scriptai
   ```

2. **Install Dependencies**:

   ```
   pnpm install
   ```

3. **Set Up Environment Variables**: Create `.env.local` in `apps/web` and `apps/api`:

   ```
   # apps/web/.env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # apps/api/.env
   PORT=8000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   GOOGLE_AI_STUDIO_API_KEY=your_google_ai_studio_key
   ```

4. **Run Development Servers**:

   ```
   pnpm run dev
   ```

   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`

### Testing

- Run tests:

  ```
  pnpm run test
  ```
- Write tests in `apps/web/__tests__` and `apps/api/src/__tests__`.

### Best Practices

- Follow ESLint/TypeScript rules in `packages/config`.
- Use TurboRepo for builds (`turbo.json`).
- Write clear commit messages (e.g., `feat: add tone filter`).
- Mock AI API responses for local testing.

## Contributing

We welcome contributions! Follow these steps:

1. **Join Discord**: https://discord.gg/f6AG7kt7
2. **Pick an Issue**: Check open issues on GitHub or create one (e.g., `feat: add multi-platform script support`, `bug: fix thumbnail generator`).
3. **Fork and Branch**: Fork the repo, create a branch (`git checkout -b feat/issue-name`).
4. **Commit Changes**: Use clear messages (`git commit -m "feat: implement issue-name"`).
5. **Push and PR**: Push to your branch (`git push origin feat/issue-name`) and open a pull request.
6. **Describe Your PR**: Reference the issue (e.g., “Fixes #123”) and explain changes.

For new features or bugs, open an issue with a clear title (e.g., `feat: multi-language subtitle support`) and description.