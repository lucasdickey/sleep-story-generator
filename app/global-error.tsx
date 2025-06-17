'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
          <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
            <button
              onClick={() => reset()}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}