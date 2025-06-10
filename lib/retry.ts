// Retry configuration
export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

// Default retry options
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  onRetry: () => {},
};

// Calculate delay with exponential backoff
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

// Sleep for specified milliseconds
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry wrapper for async functions
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on the last attempt
      if (attempt === config.maxAttempts) {
        break;
      }

      // Call retry callback
      config.onRetry(lastError, attempt);

      // Calculate and apply delay
      const delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.maxDelay,
        config.backoffMultiplier
      );

      console.log(
        `Retry attempt ${attempt}/${config.maxAttempts} after ${delay}ms delay`
      );
      await sleep(delay);
    }
  }

  // If we get here, all attempts failed
  throw new Error(
    `Failed after ${config.maxAttempts} attempts: ${
      lastError?.message || "Unknown error"
    }`
  );
}

// Specialized retry for generation steps
export async function retryGeneration<T>(
  stepName: string,
  fn: () => Promise<T>,
  onFailure?: (attempts: number) => Promise<void>
): Promise<T> {
  try {
    return await withRetry(fn, {
      maxAttempts: 3,
      initialDelay: 2000,
      onRetry: (error, attempt) => {
        console.error(
          `${stepName} failed on attempt ${attempt}:`,
          error.message
        );
      },
    });
  } catch (error) {
    // After 3 failed attempts, call the failure callback
    if (onFailure) {
      await onFailure(3);
    }
    throw error;
  }
}
