"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { postFormSchema, type ProjectIdeaInsert } from "./schema";

// ─── Shared types ────────────────────────────────────────

export type PostFormState =
  | {
      ok: false;
      fieldErrors?: Record<string, string[]>;
      formError?: string;
    }
  | {
      ok: true;
      message: string;
      insertedRow: ProjectIdeaInsert;
    };

// ─── Helpers ─────────────────────────────────────────────

/** Safely parse a hidden JSON form field. */
function parseJsonField(formData: FormData, key: string): unknown {
  try {
    return JSON.parse(formData.get(key)?.toString() ?? "[]");
  } catch {
    return [];
  }
}

// ─── createProjectIdea (primary action) ──────────────────

/**
 * Server Action: createProjectIdea
 *
 * 1. Validates formData with Zod (title, problem_statement, tech_stack, variant).
 * 2. Authenticates the current session via @supabase/ssr.
 * 3. Inserts a row into the `project_ideas` table.
 * 4. Calls revalidatePath('/') on success so the feed refreshes.
 */
export async function createProjectIdea(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  /* ── 1. Validate ───────────────────────────────────── */
  const parsed = postFormSchema.safeParse({
    title: formData.get("title"),
    problemStatement: formData.get("problemStatement"),
    urls: parseJsonField(formData, "urls"),
    techStacks: parseJsonField(formData, "techStacks"),
    variant: formData.get("variant"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      ok: false,
      fieldErrors: flattened.fieldErrors as Record<string, string[]>,
      formError: flattened.formErrors[0],
    };
  }

  /* ── 2. Authenticate via @supabase/ssr ─────────────── */
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      formError: "You must be signed in to submit a project idea.",
    };
  }

  /* ── 3. Build row & insert ─────────────────────────── */
  const row: ProjectIdeaInsert = {
    user_id: user.id,
    title: parsed.data.title,
    problem_statement: parsed.data.problemStatement,
    tech_stack: {
      tags: parsed.data.techStacks,
      urls: parsed.data.urls,
    },
    variant: parsed.data.variant,
  };

  const { error: dbError } = await supabase
    .from("project_ideas")
    .insert(row);

  if (dbError) {
    console.error("[createProjectIdea] DB insert failed:", dbError.message);
    return {
      ok: false,
      formError: "Failed to save project idea. Please try again later.",
    };
  }

  /* ── 4. Revalidate the feed ────────────────────────── */
  revalidatePath("/");

  return {
    ok: true,
    message: "Project idea submitted successfully!",
    insertedRow: row,
  };
}

// Re-export under the old name so existing imports keep working.
export const submitPostForm = createProjectIdea;
