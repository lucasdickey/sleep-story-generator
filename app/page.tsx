import { StoryConfigurationForm } from "@/components/StoryConfigurationForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Key To Sleep
              </span>
            </h1>
            <p className="text-l font-semibold text-gray-600">
              Create a personalized bedtime audio story crafted just for your
              child
            </p>
            <p className="text-l text-gray-600">
              ~10-minute audio story taking your child on a journey to slumber.
              Only $1.00 per story.
            </p>
          </div>

          <StoryConfigurationForm />
        </div>
      </div>
    </main>
  );
}
