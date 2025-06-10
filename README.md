# Key To Sleep - Custom Sleep Story Platform

This project has evolved from a podcast automation tool to a **fully-integrated custom sleep story generation platform** where users can create personalized bedtime stories with just a few clicks.

## 🌟 Platform Features

### Story Customization

- **Flexible Character Creation**:
  - Optional character name, age, and gender
  - Companion animal selection from 100+ child-friendly options
  - Climate and region settings for story location
  - Values/morals emphasis (courage, empathy, determination, etc.)
  - All fields have smart defaults if not specified

### User Experience

- **Interactive Form**: Beautiful, responsive design with real-time preview
- **Simple Payment**: $1 per story via Stripe Checkout (reduced from $2)
- **Real-time Progress**: GitHub Actions-style UI showing generation steps
- **SMS Notifications**: Text alerts via Amazon SNS when complete
- **Premium Downloads**: Spotify-style media player with multiple download options
- **No Account Required**: Token-based system for privacy and simplicity

## 💻 Technical Architecture

### Frontend Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: Tailwind CSS v3 with custom components
- **UI Features**:
  - Responsive story configuration form
  - Real-time madlib-style preview
  - Progress tracking with step indicators
  - Media player with artwork display
  - Download page with ZIP functionality

### Backend Services

- **Payment Processing**:
  - Stripe MCP (Model Context Protocol) integration
  - Webhook handling for payment events
  - Phone number collection with SMS consent
- **Database**: Supabase for job tracking, progress updates, and asset metadata
- **SMS Service**: Amazon SNS for international notifications
- **Storage**: AWS S3 with organized directory structure
- **Generation Pipeline**:
  - OpenAI GPT-4 for story, metadata, and artwork
  - ElevenLabs for voice synthesis
  - Custom retry logic with exponential backoff

### Key Features Implemented

- **Asset Management**:
  - MP3 files with embedded ID3 tags and artwork
  - Individual file downloads or ZIP bundle
  - Indefinite storage retention
  - Token-based secure access
- **Error Handling**:
  - 3x retry mechanism for each generation step
  - Customer service integration (mailto:apes@a-ok.sh)
  - Detailed error tracking in database
  - SMS notifications for failures
- **Progress System**:
  - Real-time updates (2.5s polling)
  - Shareable progress URLs
  - Development mode with simulated progress
  - Download button on completion

## 🚀 Core Generation Pipeline

1. **Story Generation** (OpenAI GPT-4o) - Must complete first
2. **Metadata Generation** (OpenAI) - Parallel processing
3. **Artwork Generation** (OpenAI DALL-E) - Parallel processing
4. **Audio Generation** (ElevenLabs) - Parallel with metadata embedding
5. **Asset Storage** (AWS S3) - Organized by date and job token
6. **Database Updates** (Supabase) - Progress tracking and asset records

## 📁 Project Structure

### API Endpoints

- `/api/create-payment` - Initiates Stripe checkout session
- `/api/webhooks/stripe` - Handles payment completion
- `/api/generate-story` - Triggers story generation workflow
- `/api/progress/[token]` - Returns real-time progress updates
- `/api/download-zip/[token]` - Creates asset bundle for download

### Key Libraries

- `lib/generation.ts` - Core generation orchestration
- `lib/supabase.ts` - Database operations
- `lib/s3.ts` - AWS S3 asset management
- `lib/sns.ts` - SMS notifications
- `lib/retry.ts` - Retry logic utilities
- `lib/mp3-metadata.ts` - ID3 tag embedding

### Pages

- `/` - Story configuration and payment
- `/progress/[token]` - Real-time generation progress
- `/download/[token]` - Asset download page with media player

## 🔧 Environment Configuration

Required environment variables:

```env
# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o

# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# AWS
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
AWS_SNS_REGION=

# App
NEXT_PUBLIC_BASE_URL=
```

## 🚦 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Set up required services:
   - Stripe account with webhook endpoint
   - Supabase project with required tables
   - AWS S3 bucket with public read access
   - Amazon SNS for SMS notifications
5. Run development server: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

Required Supabase tables:

- `jobs` - Tracks generation jobs and payment status
- `job_progress` - Real-time progress updates
- `generated_assets` - Stores asset URLs and metadata

See migration files for complete schema.

## 🧪 Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## 📈 Recent Updates

### Payment Integration (Task Group 2)

- Stripe MCP setup with semantic payment flow
- Reduced price from $2 to $1
- Phone number collection in checkout
- Webhook processing for job creation

### SMS Notifications (Task Group 3)

- Migrated from Twilio to Amazon SNS
- International phone support
- Success and failure notifications
- Retry mechanism integration

### Asset Management (Task Group 5)

- Spotify-style media player
- ZIP download functionality
- MP3 metadata embedding with artwork
- Copy-to-clipboard for story text

### Backend APIs (Task Group 6)

- Generation wrapper functions
- Progress callback system
- Parallel processing optimization
- Comprehensive error handling

### Reliability (Task Group 7)

- 3x retry with exponential backoff
- Customer service integration
- Detailed error tracking
- Graceful degradation

---

## 🤝 Contributing

See [AGENTS.md](AGENTS.md) for AI collaboration guidelines and [TASKS.md](TASKS.md) for the project roadmap.

## 📝 License

This project is private and proprietary.

## 🙏 Credits

Built with ❤️ using Next.js, OpenAI, ElevenLabs, Stripe, Supabase, and AWS.
