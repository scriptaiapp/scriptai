# 🎬 ScriptAI: Your Personal AI Content Assistant

> **Transform your YouTube content creation with AI that learns your style and voice.** ScriptAI is a personalized AI assistant that helps YouTubers generate scripts, thumbnails, subtitles, and more - all tailored to their unique content style and audience.

[![Discord](https://img.shields.io/badge/Discord-Join%20Community-7289DA?style=for-the-badge&logo=discord)](https://discord.gg/f6AG7kt7)
[![GitHub Stars](https://img.shields.io/github/stars/scriptaiapp/scriptai?style=for-the-badge)](https://github.com/scriptaiapp/scriptai/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)


### 🎯 Core AI Features
- **Personalized Script Generation** - AI learns your style from 3-5 videos
- **Smart Topic Research** - Web research and PDF analysis for content ideas
- **AI Thumbnail Creator** - Generate thumbnails matching your channel's style
- **Multi-language Subtitles** - Create editable subtitles in multiple languages
- **Voice Cloning Dubbing** - Translate audio while keeping your voice
- **Course Module Builder** - Complete course creation for educators

### 🔗 Platform Integration
- **YouTube Channel Connection** - Seamless OAuth integration
- **Referral Credit System** - Earn credits through community referrals
- **Premium Feature Unlocking** - Advanced AI capabilities
- **Personalized AI Training**: Upload 3–5 videos to train a custom AI model for your style and language.
- **Script Generation**: Input a topic and context to generate personalized scripts or let AI modify your existing drafted script.
- **Topic Research**: Adds relevant links/stats from web or uploaded PDFs or let AI do the research for you.
- **Thumbnail Generator**: Creates thumbnails based on your past thumbnail style.
- **Course Module**: Dedicated feature specially for educators to create a complete course module, playlist for a particular 
topic.
- **Subtitle Generator**: Creates multi-language, editable subtitles for your videos.
- **Audio Translation**: Generates audio in multiple languages in your own voice using generative voice cloning (e.g., 
ElevenLabs), removing language barriers and letting your videos reach a global audience.
- **Credit System**: Earn credits via referrals to unlock premium features.

## Future Features

- **AI Video Generator**: Create AI-generated videos, reels like Sora, Veo.
- **Multi-Platform**: Expand same features for platforms like TikTok, Instagram Reels, or podcasts.
- **Collaboration Mode**: Real-time collaboration for teams.
- **Advanced Personalization**: Train AI with custom fine-tuned model.
- **Monetization Marketplace**: Buy/sell scripts or hire writers.

### 🛠️ Developer Experience
- **Modern Tech Stack** - Next.js 15, React 19, TypeScript, Tailwind CSS
- **Monorepo Architecture** - Turbo + pnpm for efficient development
- **Comprehensive Testing** - Jest, E2E testing, and linting
- **Type Safety** - Full TypeScript coverage with Zod validation

## 🚀 Quick Start

### Prerequisites
- **Node.js** 19.x or higher
- **pnpm** package manager
- **Git** for version control

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/scriptaiapp/scriptai.git
   cd scriptai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment files
   cp apps/web/.env.example apps/web/.env.local
   cp apps/api/.env.example apps/api/.env
   
   # Edit with your actual values
   # See Environment Setup section below
   ```

4. **Start development servers**
   ```bash
   pnpm run dev
   ```

5. **Open your browser**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:8000](http://localhost:8000)

### Environment Setup

Create `.env.local` in `apps/web`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create `.env` in `apps/api`:
```env
PORT=8000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GOOGLE_AI_STUDIO_API_KEY=your_google_ai_studio_key
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start all development servers |
| `pnpm run dev:new` | Start web app on port 4000 |
| `pnpm run build` | Build all packages and apps |
| `pnpm run test` | Run all tests |
| `pnpm run test:e2e` | Run end-to-end tests |
| `pnpm run lint` | Lint all code |
| `pnpm run format` | Format code with Prettier |

## 🏗️ Project Structure

```
scriptai/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/               # App Router pages
│   │   │   ├── dashboard/     # Main app features
│   │   │   │   ├── scripts/   # Script generation
│   │   │   │   ├── research/  # Topic research
│   │   │   │   ├── train/     # AI training
│   │   │   │   ├── thumbnails/# Thumbnail generation
│   │   │   │   ├── subtitles/ # Subtitle creation
│   │   │   │   ├── dubbing/   # Audio translation
│   │   │   │   └── courses/   # Course modules
│   │   │   └── api/           # Next.js API routes
│   │   ├── components/        # React components
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities & config
│   └── api/                   # NestJS backend
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── api/                  # Shared API types
│   ├── validations/          # Zod schemas
│   └── config/              # Shared configs
```

## 🤝 Contributing

We love contributions! Whether you're fixing bugs, adding features, or improving documentation, your help is welcome.

### Getting Started
1. **Join our Discord** - [https://discord.gg/f6AG7kt7](https://discord.gg/f6AG7kt7)
2. **Check existing issues** - Look for "Good First Issue" labels
3. **Read our contributing guide** - [CONTRIBUTING.md](./CONTRIBUTING.md)
4. **Fork and clone** - Create your own fork of the repository
5. **Create a branch** - Use descriptive branch names (`feat/add-new-feature`)
6. **Make changes** - Follow our coding standards
7. **Submit a PR** - Include tests and documentation

### Good First Issues
- 🐛 Bug fixes
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- 🔧 Configuration improvements

See our [Contributing Guide](./CONTRIBUTING.md) for detailed information about our development process, coding standards, and how to submit your first contribution.

## 📚 Documentation

- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to ScriptAI
- [Code of Conduct](./CODE_OF_CONDUCT.md) - Community guidelines
- [Setup Guide](./docs/SETUP.md) - Development environment setup
- [Security Policy](./SECURITY.md) - Security guidelines

## 🌟 Community

- **Discord** - [Join our community](https://discord.gg/f6AG7kt7)
- **Twitter/X** - [@ScriptAI](https://twitter.com/ScriptAI)
- **GitHub** - [Star us on GitHub](https://github.com/scriptaiapp/scriptai)
- **Issues** - [Report bugs or request features](https://github.com/scriptaiapp/scriptai/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Thanks to all our contributors who help make ScriptAI better every day!

---

**Made with ❤️ by the ScriptAI community**

---

**Made with ❤️ by the ScriptAI community**