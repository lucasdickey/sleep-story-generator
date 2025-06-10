import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
};

async function fetchAssetBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch asset: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      );
    }

    // Get job by token
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("transaction_token", token)
      .single();

    if (jobError || !job || job.status !== "completed") {
      return NextResponse.json(
        { error: "Job not found or not completed" },
        { status: 404 }
      );
    }

    // Get generated assets
    const { data: assets, error: assetsError } = await supabase
      .from("generated_assets")
      .select("*")
      .eq("job_id", job.id)
      .single();

    if (assetsError || !assets) {
      return NextResponse.json({ error: "Assets not found" }, { status: 404 });
    }

    // Create ZIP file
    const zip = new JSZip();
    const storyFolder = zip.folder(assets.title || "sleep-story");

    if (!storyFolder) {
      throw new Error("Failed to create ZIP folder");
    }

    // Add story text
    if (assets.story_text) {
      storyFolder.file("story.txt", assets.story_text);
    }

    // Add metadata as JSON
    const metadata = {
      title: assets.title,
      description: assets.description,
      created_at: assets.created_at,
      customization: job.customization,
      character_name: job.customization?.characterName,
      companion_name: job.customization?.companionName,
      companion_type: job.customization?.companionType,
      location: {
        climate: job.customization?.climate,
        region: job.customization?.region,
      },
      values: job.customization?.values || [],
    };
    storyFolder.file("metadata.json", JSON.stringify(metadata, null, 2));

    // Fetch and add audio file
    if (assets.audio_url) {
      try {
        const audioBuffer = await fetchAssetBuffer(assets.audio_url);
        storyFolder.file(`${assets.title || "story"}.mp3`, audioBuffer);
      } catch (error) {
        console.error("Error fetching audio:", error);
      }
    }

    // Fetch and add artwork
    if (assets.artwork_url) {
      try {
        const artworkBuffer = await fetchAssetBuffer(assets.artwork_url);
        storyFolder.file("artwork.png", artworkBuffer);
      } catch (error) {
        console.error("Error fetching artwork:", error);
      }
    }

    // Add a README file
    const readmeContent = `# ${assets.title || "Your Sleep Story"}

${assets.description || "A personalized bedtime story created just for you."}

## Contents
- story.txt: The full text of your sleep story
- ${assets.title || "story"}.mp3: Audio narration with embedded artwork
- artwork.png: Custom artwork for your story
- metadata.json: Story details and customization info

## Story Details
${
  job.customization?.characterName
    ? `- Main Character: ${job.customization.characterName}`
    : ""
}
${
  job.customization?.companionName
    ? `- Companion: ${job.customization.companionName} (${job.customization.companionType})`
    : ""
}
${
  job.customization?.climate && job.customization?.region
    ? `- Setting: ${job.customization.climate} ${job.customization.region}`
    : ""
}
${
  job.customization?.values && job.customization.values.length > 0
    ? `- Values: ${job.customization.values.join(", ")}`
    : ""
}

Created with ❤️ by Key To Sleep
`;

    storyFolder.file("README.md", readmeContent);

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Return ZIP file as download
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${
          assets.title || "sleep-story"
        }.zip"`,
      },
    });
  } catch (error) {
    console.error("Error creating ZIP:", error);
    return NextResponse.json(
      { error: "Failed to create ZIP file" },
      { status: 500 }
    );
  }
}
