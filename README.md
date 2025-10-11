# Script AI: Personalized creator tool for Youtubers

> **Transform your YouTube content creation with AI that learns your style and voice.** Script AI is a personalized AI assistant that helps YouTubers generate scripts, thumbnails, subtitles, and more - all tailored to their unique content style and audience.

[![Discord](https://img.shields.io/badge/Discord-Join%20Community-7289DA?style=for-the-badge&logo=discord)](https://discord.com/invite/k9sZcq2gNG)
[![GitHub Stars](https://img.shields.io/github/stars/scriptaiapp/scriptai?style=for-the-badge)](https://github.com/scriptaiapp/scriptai/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)


### 🎯 Core AI Features
- **Script Generation** - AI learns your style from 3-5 videos
- **Smart Idea Research** - Web research and PDF analysis for new content ideas
- **AI Thumbnail Creator** - Generate thumbnails matching your channel's style
- **Multi-language Subtitles** - Create editable subtitles in multiple languages
- **Voice Cloning Dubbing** - Translate audio in multiple languages by cloning your voice
- **Course Module Builder** - Complete course creation for educators

## Future Features

- **AI Video Generator**: Create AI-generated videos, reels like Sora, Veo.
- **Multi-Platform**: Expand the features for platforms like TikTok, Instagram Reels, or podcasts.
- **Collaboration Mode**: Real-time collaboration for teams.
- **Advanced Personalization**: Train AI with custom fine-tuned model.

### 🛠️ Developer Experience
- **Modern Tech Stack** - Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase
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
   cp apps/web/.env.example apps/web/.env
   cp apps/api/.env.example apps/api/.env
   
   ```

4. **Start development servers**
   ```bash
   pnpm run dev
   ```

5. **Open your browser**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:8000](http://localhost:8000)

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
│   │   │   │   ├── research/  # Idea research
│   │   │   │   ├── train/     # AI model training
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
1. **Join our Discord** - [https://discord.gg/k9sZcq2gNG](https://discord.gg/k9sZcq2gNG)
2. **Check existing issues** - Look for "Good First Issue" labels
3. **Read our contributing guide** - [CONTRIBUTING.md](./CONTRIBUTING.md)
4. **Fork and clone** - Create your own fork of the repository
5. **Create a branch** - Use descriptive branch names (`feat:add-new-feature`)
6. **Make and test the changes** - Follow our coding standards
7. **Submit a PR** - Include well written description of what the PR does, include screenshots/videos if needed.

See our [Contributing Guide](./CONTRIBUTING.md) for detailed information about our development process, coding standards, and how to submit your first contribution.

## 📚 Documentation

- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to ScriptAI
- [Code of Conduct](./CODE_OF_CONDUCT.md) - Community guidelines
- [Setup Guide](./docs/SETUP.md) - Development environment setup
- [Security Policy](./SECURITY.md) - Security guidelines

## 🌟 Community

- **Discord** - [Join our community](https://discord.com/invite/k9sZcq2gNG)
<!-- - **Twitter/X** - [@ScriptAI](https://twitter.com/ScriptAI) -->
- **GitHub** - [Star us on GitHub](https://github.com/scriptaiapp/scriptai)
- **Issues** - [Report bugs or request features](https://github.com/scriptaiapp/scriptai/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Made with ❤️ by the Script AI community**
