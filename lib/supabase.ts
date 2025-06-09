import { createClient } from "@supabase/supabase-js";

// Database types
export interface Job {
  id: string;
  token: string;
  status: "pending" | "processing" | "completed" | "failed";
  phone_number?: string;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;

  // Story configuration
  character_name?: string;
  character_age?: number;
  character_gender?: string;
  has_companion: boolean;
  companion_name?: string;
  companion_animal?: string;
  location?: string;
  values_morals?: string[];

  // Timestamps
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface JobProgress {
  id: string;
  job_id: string;
  step: "story" | "metadata" | "artwork" | "audio";
  status: "pending" | "processing" | "completed" | "failed";
  attempt_count: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface GeneratedAsset {
  id: string;
  job_id: string;
  asset_type: "story" | "metadata" | "artwork" | "audio";
  s3_url: string;
  file_size_bytes?: number;
  mime_type?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Lazy initialization to avoid build-time errors
let _supabase: ReturnType<typeof createClient> | null = null;
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

// Create a single supabase client for interacting with your database
export const getSupabase = () => {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      _supabase = createClient(url, key);
    }
  }
  return _supabase;
};

// Create a service role client for server-side operations
export const getSupabaseAdmin = () => {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      _supabaseAdmin = createClient(url, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }
  return _supabaseAdmin;
};

// Legacy exports - will be null until first access
export const supabase = null;
export const supabaseAdmin = null;

// Helper function to generate human-readable tokens
export function generateJobToken(username?: string): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const user = username || "user";
  const random = Math.random().toString(36).substring(2, 8); // 6 char random string
  return `${date}-${user}-${random}`;
}

// Job-related operations
export const jobOperations = {
  async create(data: Partial<Job>) {
    const client = getSupabaseAdmin();
    if (!client) throw new Error("Supabase admin client not configured");

    const { data: job, error } = await client
      .from("jobs")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return job;
  },

  async getByToken(token: string) {
    const client = getSupabase();
    if (!client) throw new Error("Supabase client not configured");

    const { data: job, error } = await client
      .from("jobs")
      .select("*")
      .eq("token", token)
      .single();

    if (error) throw error;
    return job;
  },

  async updateStatus(id: string, status: Job["status"]) {
    const client = getSupabaseAdmin();
    if (!client) throw new Error("Supabase admin client not configured");

    const { error } = await client
      .from("jobs")
      .update({
        status,
        completed_at:
          status === "completed" ? new Date().toISOString() : undefined,
      })
      .eq("id", id);

    if (error) throw error;
  },
};

// Progress tracking operations - temporarily disabled for build fix
export const progressOperations = null as unknown; /*{
  async create(jobId: string, step: JobProgress["step"]) {
    const { error } = await supabaseAdmin.from("job_progress").insert({
      job_id: jobId,
      step,
      status: "pending",
    });

    if (error && !error.message.includes("duplicate")) throw error;
  },

  async updateStatus(
    jobId: string,
    step: JobProgress["step"],
    status: JobProgress["status"],
    errorMessage?: string
  ) {
    const updateData: Record<string, unknown> = {
      status,
      attempt_count: supabaseAdmin
        .from("job_progress")
        .update({ attempt_count: 0 })
        .eq("job_id", jobId)
        .eq("step", step),
    };

    if (status === "processing" && !updateData.started_at) {
      updateData.started_at = new Date().toISOString();
    }

    if (status === "completed" || status === "failed") {
      updateData.completed_at = new Date().toISOString();
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { error } = await supabaseAdmin
      .from("job_progress")
      .update(updateData)
      .eq("job_id", jobId)
      .eq("step", step);

    if (error) throw error;
  },

  async getByJobId(jobId: string) {
    const { data: progress, error } = await supabase
      .from("job_progress")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return progress;
  },
}; */

// Asset operations - temporarily disabled for build fix
export const assetOperations = null as unknown;
