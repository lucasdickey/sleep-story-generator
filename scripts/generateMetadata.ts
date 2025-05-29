/**
 * generateMetadata.ts
 *
 * Script to generate episode metadata (description, title, etc.) using OpenAI.
 * Uses the most recent story file in the output directory for input and outputs metadata as <episodeId>-metadata.json.
 * Requires OPENAI_API_KEY and OPENAI_MODEL in .env.local.
 */

(async () => {
  const fs = require('fs/promises');
  const path = require('path');
  const dotenv = require('dotenv');
  const { OpenAI } = require('openai');

  dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const OUTPUT_DIR = path.resolve(__dirname, '../output');
const METADATA_PROMPT_FILE = path.resolve(__dirname, '../prompts/metadata.txt');

async function getLatestStoryFile(): Promise<{ path: string, episodeId: string }> {
  const files = await fs.readdir(OUTPUT_DIR);
  const storyFiles = files.filter((f: string) => f.endsWith('-story.txt'));
  if (storyFiles.length === 0) throw new Error('No story files found in output directory.');
  storyFiles.sort((a: string, b: string) => b.localeCompare(a));
  const latest = storyFiles[0];
  const episodeId = latest.replace('-story.txt', '');
  return { path: path.join(OUTPUT_DIR, latest), episodeId };
}

async function readPrompt(filePath: string): Promise<string> {
  return (await fs.readFile(filePath, 'utf8')).trim();
}

async function generateMetadata() {
  try {
    const { path: storyFilePath, episodeId } = await getLatestStoryFile();
    const storyText = await fs.readFile(storyFilePath, 'utf8');
    // Polish: Enhance the prompt to require a story-specific, evocative title in the format:
    // '[Protagonist] and the [Setting/Theme] - An A-OK Sleep Story' or similar.
    const polishTitleInstruction = `\n\n---\n\nIMPORTANT:\n1. Create a creative, evocative, and story-specific title in the following style, based on the story content:\n- Elena and the Tundra's Whisper - An A-OK Sleep Story\n- Danika and the Rainforest Path - An A-OK Sleep Story\n- Elias & The Silver Fox: Under the Canopy of Stars - An A-OK Sleep Story\n- Leah and the Whispering Dunes - An A-OK Sleep Story\n- Colette and the Appalachian Path to Rest - An A-OK Sleep Story\n\nThe title should include the protagonist's name and a setting or motif from the story, followed by ' - An A-OK Sleep Story'.\nReturn the title as the 'title' field in the output JSON.\n2. The description field MUST end with the following block (after the main prose):\nVoice: A-OK Lucas\n\nMusic: None / acapella\n\nMerch: www.a-ok.shop\n`;
    const metadataPrompt = (await readPrompt(METADATA_PROMPT_FILE)) + polishTitleInstruction;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || 'gpt-4o';
    const messages = [
      { role: 'system', content: 'You are a podcast metadata generator.' },
      { role: 'user', content: metadataPrompt + '\n' + storyText }
    ];
    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: 600,
      temperature: 0.7,
    });
    const metadata = completion.choices[0]?.message.content?.trim() || '';
    const outputMetadataFile = path.join(OUTPUT_DIR, `${episodeId}-metadata.json`);
    await fs.writeFile(outputMetadataFile, metadata, 'utf8');
    console.log(`Metadata saved to ${outputMetadataFile}`);
  } catch (err) {
    console.error('Error generating metadata:', err);
    process.exit(1);
  }
}

generateMetadata();
})();
