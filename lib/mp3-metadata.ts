import NodeID3 from "node-id3";
import { Buffer } from "buffer";

interface MP3Metadata {
  title: string;
  artist?: string;
  album?: string;
  genre?: string;
  comment?: string;
  year?: string;
  artworkBuffer?: Buffer;
  artworkMimeType?: string;
}

/**
 * Embed ID3 metadata and artwork into an MP3 buffer
 * @param mp3Buffer The original MP3 audio buffer
 * @param metadata The metadata to embed
 * @returns Buffer with embedded metadata
 */
export async function embedMP3Metadata(
  mp3Buffer: Buffer,
  metadata: MP3Metadata
): Promise<Buffer> {
  try {
    // Prepare ID3 tags
    const tags: NodeID3.Tags = {
      title: metadata.title,
      artist: metadata.artist || "Key To Sleep",
      album: metadata.album || "Custom Sleep Stories",
      genre: metadata.genre || "Spoken & Audio",
      comment: {
        language: "eng",
        text:
          metadata.comment ||
          "A personalized bedtime story created just for you",
      },
      year: metadata.year || new Date().getFullYear().toString(),
      // Additional metadata
      performerInfo: "Key To Sleep - AI Generated",
      publisher: "Key To Sleep",
    };

    // Add artwork if provided
    if (metadata.artworkBuffer && metadata.artworkMimeType) {
      tags.image = {
        mime: metadata.artworkMimeType,
        type: {
          id: 3, // Cover (front)
          name: "front cover",
        },
        description: "Story Artwork",
        imageBuffer: metadata.artworkBuffer,
      };
    }

    // Write tags to the MP3 buffer
    const taggedBuffer = NodeID3.write(tags, mp3Buffer);

    // Return the buffer (NodeID3 returns Buffer or the original if failed)
    if (Buffer.isBuffer(taggedBuffer)) {
      return taggedBuffer;
    }

    // If tagging failed, return original
    console.warn("Failed to embed ID3 tags, returning original MP3");
    return mp3Buffer;
  } catch (error) {
    console.error("Error embedding MP3 metadata:", error);
    // Return original buffer on error
    return mp3Buffer;
  }
}

/**
 * Extract existing ID3 metadata from an MP3 buffer
 * @param mp3Buffer The MP3 buffer to read from
 * @returns The extracted metadata or null if none found
 */
export function extractMP3Metadata(mp3Buffer: Buffer) {
  try {
    const tags = NodeID3.read(mp3Buffer);
    return tags;
  } catch (error) {
    console.error("Error extracting MP3 metadata:", error);
    return null;
  }
}

/**
 * Create metadata object from story details
 */
export function createStoryMetadata(
  title: string,
  description: string,
  customization?: {
    characterName?: string;
    companionName?: string;
  }
): MP3Metadata {
  const characterName = customization?.characterName || "You";
  const companionName = customization?.companionName;

  let artist = `Story for ${characterName}`;
  if (companionName) {
    artist += ` and ${companionName}`;
  }

  return {
    title,
    artist,
    album: "Custom Sleep Stories",
    genre: "Spoken & Audio",
    comment: description,
    year: new Date().getFullYear().toString(),
  };
}
