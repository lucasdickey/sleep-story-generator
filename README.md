# Key To Sleep Podcast Automation

A fully automated system for generating, narrating, illustrating, and syndicating peaceful sleep stories as podcast episodes. Built for the "Key To Sleep" podcast, this project leverages AI, serverless infrastructure, and modern DevOps practices to deliver a new episode every day.

---

## Features
- **Automated Story Generation**: Uses OpenAI GPT with stochastic prompts for unique, peaceful stories.
- **Text-to-Speech Narration**: ElevenLabs API generates high-quality audio narration with a custom voice.
- **Episode Artwork**: OpenAI image generation creates unique artwork for each episode.
- **Episode Description**: AI-generated summaries and titles for podcast feeds.
- **RSS Feed**: Standards-compliant feed for Apple, Spotify, and other podcast platforms.
- **Web App**: Next.js frontend displays episodes, audio, artwork, and descriptions.
- **Scheduled Automation**: GitHub Actions orchestrate the full pipeline daily.
- **Runbooks**: Markdown checklists for onboarding, branching, merging, and episode release.

---

## Tech Stack
- **Frontend**: Next.js (React, TypeScript, Vercel)
- **Backend/API**: Next.js API routes, Node.js scripts
- **AI Services**: OpenAI (text & image), ElevenLabs (TTS)
- **Automation**: GitHub Actions
- **Storage**: Vercel storage (BLOBS), Supabase for metadata
- **Podcast Syndication**: RSS feed

---

## Project Structure
```
/AGENTS.md         # Tech stack & best practices
/TASKS.md          # Project plan & workflow
/runbooks/         # .mrd runbooks for common tasks
/pages/            # Next.js app pages
/public/episodes/  # Generated assets (audio, images, etc.)
/scripts/          # Automation scripts
```

---

## Getting Started
1. **Clone the repo:**
   ```sh
   git clone <repo-url>
   cd key-to-sleep
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure secrets:**
   - Add API keys (OpenAI, ElevenLabs, Supabase) to GitHub Actions secrets and your local `.env` if running locally.
4. **Run locally:**
   ```sh
   npm run dev
   # or
   vercel dev
   ```
5. **Test the pipeline:**
   - Use runbooks in `/runbooks` for onboarding, branching, merging, and release.
   - Run scripts and builds as described in AGENTS.md and TASKS.md.

---

## Development Workflow
- **Branching:** Start each story/feature on a new branch (see `runbooks/branch-ramp-up.mrd`).
- **Testing:** Test atomically after each logical task group, including local and Vercel builds.
- **Pre-Merge:** Use `runbooks/pre-merge-check.mrd` before merging.
- **Documentation:** Update AGENTS.md and TASKS.md as requirements change.

---

## Automation & Deployment
- **Daily Pipeline:** GitHub Actions workflow runs all scripts in sequence, generates assets, updates the app and RSS feed, and deploys to Vercel.
- **Manual Release:** Follow `runbooks/episode-release.mrd` if needed.

---

## Contributing
- See `runbooks/onboarding.mrd` to get started.
- Follow all best practices in AGENTS.md.
- Use runbooks for consistent, high-quality contributions.

---

## License
MIT

---

## Acknowledgements
- OpenAI, ElevenLabs, Vercel, Supabase, and the open-source community.

---

For questions or support, open an issue or contact the maintainers.
