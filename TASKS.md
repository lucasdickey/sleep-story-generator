# TASKS.md

## Project Plan: Key To Sleep Custom Story Platform

### Platform Transformation Tasks

#### 0. Infrastructure & Configuration Setup ✅ **COMPLETED**

- [x] **API Keys & Services Setup**:

  - [x] Verify/update OpenAI API key in environment
  - [x] Verify/update ElevenLabs API key and Voice ID
  - [x] Set up Stripe account and obtain API keys
  - [x] Set up Twilio account and obtain credentials
  - [x] Configure AWS S3 bucket and IAM credentials

- [x] **Environment Configuration**:

  - [x] Create `.env.local` with all required keys
  - [x] Set up GitHub Actions secrets for production
  - [x] Configure Vercel environment variables

- [x] **Stripe Integration**:

  - [x] Set up Stripe webhook endpoint for payment processing
  - [x] Configure payment link creation and event handling
  - [x] Test basic Stripe integration locally

- [x] **AWS S3 Configuration**:

  - [x] Create S3 bucket for asset storage
  - [x] Configure bucket policies for public read access
  - [x] Implement S3 utilities with sleep-stories subdirectory organization
  - [x] Test upload/download functionality

- [x] **Database Setup** (for job tracking):

  - [x] Set up Supabase project and obtain credentials
  - [x] Create schema for job tracking and progress updates (jobs, job_progress, generated_assets tables)
  - [x] Set up database connection and utilities
  - [x] Implement all CRUD operations for job management

- [x] **Additional Infrastructure**:
  - [x] Audio processing utilities with MP3 artwork embedding
  - [x] SMS notification system with international phone formatting
  - [x] Generation pipeline foundation
  - [x] Comprehensive type definitions and error handling

#### 1. Frontend Development ✅ **COMPLETED**

- [x] Create story customization form with optional fields:
  - [x] Character name - free form text input with placeholder
  - [x] Character age - integer dropdown selector
  - [x] Character gender - dropdown (male/female/other)
  - [x] Companion toggle - yes/no boolean
  - [x] Companion name - free form text (shown only if companion = yes)
  - [x] Companion animal - dropdown with 100 child-friendly animals (shown only if companion = yes)
  - [x] Location - free form text input with placeholder (implemented as climate + region)
  - [x] Values/Morals - multi-select tag picker with options: courage, determination, empathy, compassion, ingenuity, motivated, self-sufficient, hopeful
- [x] Implement madlib-style preview: "A [gender] named [name] goes on a journey with [companion name] their trusty [companion species] through [location]."
- [x] Add default/placeholder values for all fields
- [x] Implement "Generate Custom Sleep Story Now" CTA button
- [x] Design and build with Tailwind CSS and react-icons

#### 2. Payment Integration ✅ **COMPLETED**

- [x] Set up Stripe MCP (Model Context Protocol) server
  - [x] Install and configure @stripe/mcp
  - [x] Create semantic payment flow for $1 transactions (updated from $2)
  - [x] Implement phone number collection in Stripe checkout with SMS consent
- [x] Handle payment success/failure states with webhook processing
- [x] Generate unique transaction tokens for tracking
- [x] Integrate payment flow with frontend form
- [x] Create progress page with shareable URLs

#### 3. SMS Notification System ✅ **COMPLETED**

- [x] Integrate Amazon SNS for SMS notifications (instead of Twilio)
- [x] Support international phone numbers (English messages only)
- [x] Capture phone number (from Stripe checkout)
- [x] Add proper consent language for SMS notifications (in Stripe form)
- [x] Send completion notification with progress links
- [x] Send error notification on generation failure

#### 4. Real-time Progress System ⚡ **PARTIALLY COMPLETED**

- [x] Create token-based session tracking with human-readable URLs (e.g., `/progress/2025-05-username-abc123`)
- [x] Implement polling-based progress updates (check every 2.5 seconds)
- [x] Build GitHub Actions-style progress UI with:
  - [x] Step list with checkmarks/spinners
  - [x] Elapsed time per step
  - [x] Current status indicator
  - [x] Steps: "Generating story", "Generating metadata", "Generating artwork", "Generating audio"
- [x] Display "Approximately 3 minutes" expectation message
- [x] Add note that users can close page and wait for SMS
- [x] Make progress page URL-shareable (token in URL)
- [x] Enhanced error handling with support contact (mailto:apes@a-ok.sh)
- [x] **Connect to actual generation workflow** (via Task Group 6A wrapper functions)

#### 5. Asset Management Updates ✅ **COMPLETED**

- [x] Migrate from Vercel Blob to AWS S3
- [x] Implement indefinite asset retention
- [x] Create secure, token-based download links
- [x] Build download page with:
  - [x] Spotify-style inline media player (HTML5 audio with artwork)
  - [x] "Download All" button that zips assets
  - [x] Copyable metadata display
- [x] Implement asset zipping functionality
- [x] Embed artwork into MP3 files using ID3 tags for enhanced user experience
- [x] Add proper MP3 metadata (title, artist, album, genre)

#### 6. Backend API Updates ✅ **COMPLETED**

- [x] **6A: API Wrapper Functions** - Create generation library with custom parameters
  - [x] Update generation scripts to accept custom parameters
  - [x] Create wrapper functions for story/metadata/artwork/audio generation
  - [x] Implement progress callback system for real-time database updates
  - [x] Add comprehensive error handling and retry logic
  - [x] Integrate with S3 asset storage and Supabase database
- [x] **6B: Generation API Endpoints** - Expose wrapper functions via API routes
  - [x] Create API endpoints for story generation with custom inputs
  - [x] Enhanced existing progress status API endpoints
  - [ ] Create API endpoints for asset retrieval (future enhancement)
- [x] **6C: Workflow Integration** - Connect to payment system
  - [x] Implement generation workflow (story first, then parallel metadata/artwork/audio)
  - [x] Connect Stripe webhook to trigger generation
  - [x] Keep initial implementation simple, add queues later if needed

#### 7. Error Handling & Reliability ✅ **COMPLETED**

- [x] Add comprehensive error handling for failed generations
- [x] Create customer service contact workflow (mailto:apes@a-ok.sh with pre-filled details)
- [x] Enhanced error UI with support buttons and debugging information
- [x] Individual step failure handling with contextual support links
- [x] Implement 3x retry mechanism for each generation step (with exponential backoff)
- [x] After 3 failed attempts, send SMS via Amazon SNS to contact customer service
- [x] Log all failures to Supabase for debugging (via job status updates)

### Original Project Tasks (Completed)

### 1. Project Initialization

- [x] Set up Next.js project and repository structure
- [x] Add AGENTS.md and TASKS.md for team guidance
- [x] Configure Vercel deployment

### 2. Prompt Integration

- [x] Integrate `key-to-sleep-stochastic-prompts.md` for story generation

### 3. Story Generation

- [x] Script to generate a peaceful story using OpenAI GPT and stochastic prompts
- [x] Store generated story for downstream use

### 4. Audio Generation

- [x] Script to send story text to ElevenLabs API (using Voice ID) for TTS
- [x] Save resulting audio file

### 5. Description Generation

- [x] Script to summarize story into an episode description with episode title using OpenAI
- [x] Save episode description

### 6. Artwork Generation

- [x] Script to generate unique episode artwork using OpenAI's image model (now uses gpt-image-1; scripts use async IIFE pattern for compatibility)
- [x] Save artwork image

### 7. Asset Storage

- [ ] Store all generated assets (story, audio, description, artwork) in a persistent location (Vercel storage BLOBS and Supabase for metadata)

### 8. Web App & Podcast Feed

- [ ] Update Next.js app to display new episode (audio, artwork, description) as an RSS endpoint. The RSS feed should be consistent with what is required of Apple and Spotify according to their specs. There are also open-source RSS feed validators available online that can help ensure the feed is valid.

### 9. Automation/Orchestration

- [x] Write GitHub Actions YAML workflow to:
  - Run all scripts in sequence daily
  - Pass outputs between steps
  - Redeploy app as needed
- [x] Store all secrets (API keys, Voice ID) in GitHub Actions secrets

### 10. Testing & Validation

- [x] Test each script independently
- [x] Run full workflow end-to-end in staging (via GitHub Actions)
- [ ] Validate episode appears in web app and RSS feed

### 11. Launch & Maintenance

- [ ] Launch initial version
- [ ] Monitor for errors or API changes
- [ ] Update documentation and scripts as needed

---

**Note:** Update this plan as tasks are completed or new requirements emerge. All contributors should reference this file to track project progress and next steps.
