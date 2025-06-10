"use client";

import { useState, useEffect } from "react";

interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
}

interface ProgressTrackerProps {
  transactionToken: string;
  sessionId?: string;
}

export function ProgressTracker({
  transactionToken,
  sessionId,
}: ProgressTrackerProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([
    { id: "story_generation", label: "Generating story", status: "pending" },
    {
      id: "metadata_generation",
      label: "Generating metadata",
      status: "pending",
    },
    {
      id: "artwork_generation",
      label: "Generating artwork",
      status: "pending",
    },
    { id: "audio_generation", label: "Generating audio", status: "pending" },
  ]);

  const [jobStatus, setJobStatus] = useState<
    "pending" | "running" | "completed" | "failed"
  >("pending");
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [isDevelopmentMode] = useState(process.env.NODE_ENV === "development");

  // Poll for progress updates
  useEffect(() => {
    // Development mode simulation
    if (isDevelopmentMode) {
      console.log("🎭 Development mode: Simulating progress...");
      let currentStep = 0;

      const simulateProgress = () => {
        if (currentStep < steps.length) {
          setSteps((prevSteps) =>
            prevSteps.map((step, index) => {
              if (index === currentStep) {
                return {
                  ...step,
                  status: "running" as const,
                  startedAt: new Date().toISOString(),
                };
              } else if (index < currentStep) {
                return {
                  ...step,
                  status: "completed" as const,
                  completedAt: new Date().toISOString(),
                };
              }
              return step;
            })
          );

          // Complete current step after 10 seconds
          setTimeout(() => {
            setSteps((prevSteps) =>
              prevSteps.map((step, index) => {
                if (index === currentStep) {
                  return {
                    ...step,
                    status: "completed" as const,
                    completedAt: new Date().toISOString(),
                  };
                }
                return step;
              })
            );
            currentStep++;

            if (currentStep < steps.length) {
              simulateProgress();
            } else {
              setJobStatus("completed");
            }
          }, 10000);
        }
      };

      // Start first step after 3 seconds
      setTimeout(simulateProgress, 3000);
      return;
    }

    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/progress/${transactionToken}`);
        if (!response.ok) {
          throw new Error("Failed to fetch progress");
        }

        const data = await response.json();
        setJobStatus(data.status);

        if (data.progress) {
          setSteps((currentSteps) =>
            currentSteps.map((step) => {
              const progressStep = data.progress.find(
                (p: { step: string }) => p.step === step.id
              );
              if (progressStep) {
                return {
                  ...step,
                  status: progressStep.status,
                  startedAt: progressStep.started_at,
                  completedAt: progressStep.completed_at,
                };
              }
              return step;
            })
          );
        }

        if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error("Error polling progress:", err);
        // If this is early in the process, show a friendly setup message
        if (steps.every((step) => step.status === "pending")) {
          // Don't set error state immediately - the system might still be setting up
          console.log("Initial setup in progress...");
        }
      }
    };

    // Poll immediately and then every 2.5 seconds
    pollProgress();
    const interval = setInterval(pollProgress, 2500);

    return () => clearInterval(interval);
  }, [transactionToken, isDevelopmentMode, steps]);

  const formatElapsedTime = (startedAt?: string) => {
    if (!startedAt) return "";
    const elapsed = Math.floor(
      (Date.now() - new Date(startedAt).getTime()) / 1000
    );
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const generateSupportEmail = () => {
    const subject = encodeURIComponent(
      "Sleep Story Generation Issue - Support Needed"
    );
    const body = encodeURIComponent(`Hi Support Team,

I encountered an issue with my sleep story generation. Here are the details:

Transaction Token: ${transactionToken}
${sessionId ? `Stripe Session ID: ${sessionId}` : ""}
Error Message: ${error || "Unknown error"}
Timestamp: ${new Date().toISOString()}
Page URL: ${typeof window !== "undefined" ? window.location.href : "N/A"}

Please help me resolve this issue or process a refund if needed.

Thank you!`);

    return `mailto:apes@a-ok.sh?subject=${subject}&body=${body}`;
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "running":
        return (
          <svg
            className="w-5 h-5 text-blue-600 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
      case "failed":
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
        );
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 mb-1">
              Generation Failed
            </h3>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <p className="text-xs text-red-600 mb-4">
              Don&apos;t worry! Our support team will help resolve this issue
              and ensure you get your story.
            </p>

            <a
              href={generateSupportEmail()}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Contact Support
            </a>

            <p className="text-xs text-red-500 mt-2">
              This will open your email client with pre-filled support details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Generation Progress
      </h2>

      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-4">
            {getStepIcon(step.status)}

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${
                    step.status === "completed"
                      ? "text-green-900"
                      : step.status === "running"
                      ? "text-blue-900"
                      : step.status === "failed"
                      ? "text-red-900"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>

                {step.status === "running" && (
                  <span className="text-xs text-blue-600 font-medium">
                    {formatElapsedTime(step.startedAt)}
                  </span>
                )}

                {step.status === "completed" &&
                  step.startedAt &&
                  step.completedAt && (
                    <span className="text-xs text-green-600 font-medium">
                      {formatElapsedTime(step.startedAt)} total
                    </span>
                  )}
              </div>

              {step.status === "running" && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full animate-pulse"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              )}

              {step.status === "failed" && (
                <div className="mt-2">
                  <p className="text-xs text-red-600 mb-2">
                    This step failed. Our support team has been notified.
                  </p>
                  <a
                    href={generateSupportEmail()}
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 underline"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Contact Support
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {jobStatus === "completed" && (
        <div className="mt-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-green-900">
                  Your story is ready!
                </h3>
                <p className="text-sm text-green-700">
                  You should receive an SMS with download links shortly.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href={`/download/${transactionToken}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download Your Story
            </a>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-gray-500">
        Total elapsed: {Math.floor((Date.now() - startTime) / 1000)}s •
        Transaction: {transactionToken}
      </div>
    </div>
  );
}
