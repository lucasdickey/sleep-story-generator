export {};
/**
 * generateAudio.ts
 *
 * Script to generate TTS audio for a Key To Sleep episode story using ElevenLabs API.
 * Reads story text from an input file, sends to ElevenLabs, saves resulting audio as .mp3.
 * Requires ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in .env.local.
 */

const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const OUTPUT_DIR = path.resolve(__dirname, '../output');

// Find the most recent story file in the output directory
async function getLatestStoryFile(): Promise<{ path: string, episodeId: string }> {
  const files = await fs.readdir(OUTPUT_DIR);
  const storyFiles = files.filter((f: string) => f.endsWith('-story.txt'));
  if (storyFiles.length === 0) {
    throw new Error('No story files found in output directory.');
  }
  // Sort by episode timestamp descending (most recent first)
  storyFiles.sort((a: string, b: string) => b.localeCompare(a));
  const latest = storyFiles[0];
  const episodeId = latest.replace('-story.txt', '');
  return { path: path.join(OUTPUT_DIR, latest), episodeId };
}


if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
  console.error('Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID in environment.');
  process.exit(1);
}

async function generateAudio() {
  try {
    const { path: storyFilePath, episodeId } = await getLatestStoryFile();
    const storyText = await fs.readFile(storyFilePath, 'utf8');
    const outputAudioFile = path.join(OUTPUT_DIR, `${episodeId}-audio.mp3`);

    const headers: Record<string, string> = {
      'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    };

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        text: storyText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(outputAudioFile, audioBuffer);
    console.log(`Audio saved to ${outputAudioFile}`);
  } catch (err) {
    console.error('Error generating audio:', err);
    process.exit(1);
  }
}

generateAudio();
