import { ProgressTracker } from "@/components/ProgressTracker";

interface ProgressPageProps {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default async function ProgressPage({
  params,
  searchParams,
}: ProgressPageProps) {
  const { token } = await params;
  const resolvedSearchParams = await searchParams;
  const session_id = resolvedSearchParams.session_id;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Creating Your Story
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Your personalized sleep story is being generated
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L10 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Approximately 3 minutes
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                SMS notification when complete
              </span>
            </div>
          </div>

          {/* Progress Tracker */}
          <ProgressTracker transactionToken={token} sessionId={session_id} />

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  You can safely close this page
                </h3>
                <p className="text-sm text-blue-700">
                  We&apos;ll send you an SMS notification with a download link
                  when your story is ready. You can also bookmark this page to
                  check progress anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
