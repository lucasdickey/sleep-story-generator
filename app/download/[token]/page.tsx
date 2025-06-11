import { MediaPlayer } from "@/components/MediaPlayer";
import { ClientDownloadButtons } from "@/components/ClientDownloadButtons";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key);
};

async function getJobAssets(token: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  // Get job by token
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("transaction_token", token)
    .single();

  if (!job || job.status !== "completed") {
    return null;
  }

  // Get generated assets
  const { data: assets } = await supabase
    .from("generated_assets")
    .select("*")
    .eq("job_id", job.id)
    .single();

  return { job, assets };
}

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getJobAssets(token);

  if (!data) {
    notFound();
  }

  const { job, assets } = data;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Sleep Story is Ready! 🌙
            </h1>
            <p className="text-lg text-gray-600">
              Stream or download your personalized bedtime story
            </p>
          </div>

          {/* Media Player */}
          {assets?.audio_url && assets?.artwork_url && (
            <div className="mb-8">
              <MediaPlayer
                audioUrl={assets.audio_url}
                artworkUrl={assets.artwork_url}
                title={assets.title || "Your Sleep Story"}
                description={assets.description || "A peaceful bedtime story"}
              />
            </div>
          )}

          {/* Story Details */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Story Details</h2>

            {/* Title & Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900">
                    {assets?.title || "Your Sleep Story"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900">
                    {assets?.description || "A peaceful bedtime story"}
                  </p>
                </div>
              </div>

              {/* Story Customization */}
              {job.customization && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Story Features
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {job.customization.characterName && (
                        <div>
                          <span className="font-medium">Character:</span>{" "}
                          {job.customization.characterName}
                        </div>
                      )}
                      {job.customization.companionName && (
                        <div>
                          <span className="font-medium">Companion:</span>{" "}
                          {job.customization.companionName}
                        </div>
                      )}
                      {job.customization.climate &&
                        job.customization.region && (
                          <div>
                            <span className="font-medium">Setting:</span>{" "}
                            {job.customization.climate}{" "}
                            {job.customization.region}
                          </div>
                        )}
                      {job.customization.values &&
                        job.customization.values.length > 0 && (
                          <div className="col-span-2">
                            <span className="font-medium">Values:</span>{" "}
                            {job.customization.values.join(", ")}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Download Options */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Download Options</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Individual Downloads */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Individual Files</h3>

                {assets?.audio_url && (
                  <a
                    href={assets.audio_url}
                    download={`${assets.title || "story"}.mp3`}
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                      </svg>
                      <span>Audio (MP3)</span>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                )}

                {assets?.artwork_url && (
                  <a
                    href={assets.artwork_url}
                    download={`${assets.title || "story"}-artwork.png`}
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Artwork (PNG)</span>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                )}

                {assets?.story_text && (
                  <ClientDownloadButtons
                    storyText={assets.story_text}
                    title={assets.title || "story"}
                  />
                )}
              </div>

              {/* Download All */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Complete Package</h3>
                <form action={`/api/download-zip/${token}`} method="POST">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg p-4 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                    </svg>
                    Download All (ZIP)
                  </button>
                </form>
                <p className="text-sm text-gray-600 text-center">
                  Includes audio, artwork, story text, and metadata
                </p>
              </div>
            </div>
          </div>

          {/* Copy Story Text */}
          {assets?.story_text && (
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Story Text</h2>
                <ClientDownloadButtons
                  storyText={assets.story_text}
                  title={assets.title || "story"}
                  variant="copy-only"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {assets.story_text}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
