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
              Download your personalized bedtime story
            </p>
          </div>

          {/* Simplified Story Details */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Story Details</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Title</h3>
                <p className="text-gray-900">
                  {assets?.title || "Your Sleep Story"}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-900">
                  {assets?.description || "A peaceful bedtime story"}
                </p>
              </div>

              {/* Story Customization */}
              {job.customization && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Story Features
                  </h3>
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
                    {job.customization.climate && job.customization.region && (
                      <div>
                        <span className="font-medium">Setting:</span>{" "}
                        {job.customization.climate} {job.customization.region}
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
              )}
            </div>
          </div>

          {/* Simple Download Links */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Download Your Story</h2>

            <div className="space-y-4">
              {/* Audio Download */}
              {assets?.audio_url && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">🎵 Audio Story</h3>
                  <a
                    href={assets.audio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Download MP3
                  </a>
                </div>
              )}

              {/* Artwork Download */}
              {assets?.artwork_url && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">🎨 Story Artwork</h3>
                  <a
                    href={assets.artwork_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download PNG
                  </a>
                </div>
              )}

              {/* Story Text */}
              {assets?.story_text && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">📖 Story Text</h3>
                  <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto text-sm">
                    {assets.story_text}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
