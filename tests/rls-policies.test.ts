/**
 * RLS (Row Level Security) integration tests.
 *
 * These tests authenticate as real Supabase auth users and verify that
 * the RLS policies on `project_ideas` and `comments` behave correctly:
 *
 *   1. User A can INSERT a project idea.
 *   2. User B CANNOT UPDATE or DELETE User A's project idea.
 *   3. User B CAN INSERT a comment (even with a parent_id referencing
 *      an existing comment).
 *
 * Prerequisites
 * ─────────────
 *   • Two test accounts must exist in your Supabase project's Auth:
 *       TEST_USER_A_EMAIL / TEST_USER_A_PASSWORD
 *       TEST_USER_B_EMAIL / TEST_USER_B_PASSWORD
 *   • RLS must be enabled on `project_ideas` and `comments`.
 *   • The env vars below must be set (in .env.local or the shell).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ─── env ────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const USER_A_EMAIL = process.env.TEST_USER_A_EMAIL!;
const USER_A_PASSWORD = process.env.TEST_USER_A_PASSWORD!;
const USER_B_EMAIL = process.env.TEST_USER_B_EMAIL!;
const USER_B_PASSWORD = process.env.TEST_USER_B_PASSWORD!;

// ─── helpers ────────────────────────────────────────────────

/** Create a fresh Supabase client and sign in with email/password. */
async function authenticatedClient(
  email: string,
  password: string,
): Promise<SupabaseClient> {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`Auth failed for ${email}: ${error.message}`);
  }
  return client;
}

// ─── shared state ───────────────────────────────────────────

let clientA: SupabaseClient;
let clientB: SupabaseClient;
let userAId: string;
let insertedIdeaId: string;
let rootCommentId: string;

// ─── lifecycle ──────────────────────────────────────────────

beforeAll(async () => {
  // Fail fast when env vars are missing
  for (const v of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "TEST_USER_A_EMAIL",
    "TEST_USER_A_PASSWORD",
    "TEST_USER_B_EMAIL",
    "TEST_USER_B_PASSWORD",
  ]) {
    if (!process.env[v]) {
      throw new Error(`Missing env var: ${v}. Set it in .env.local or shell.`);
    }
  }

  clientA = await authenticatedClient(USER_A_EMAIL, USER_A_PASSWORD);
  clientB = await authenticatedClient(USER_B_EMAIL, USER_B_PASSWORD);

  const {
    data: { user },
  } = await clientA.auth.getUser();
  userAId = user!.id;
});

afterAll(async () => {
  // Clean up test data (best-effort; owner can always delete their own rows)
  if (rootCommentId) {
    await clientA.from("comments").delete().eq("id", rootCommentId);
  }
  if (insertedIdeaId) {
    await clientA.from("project_ideas").delete().eq("id", insertedIdeaId);
  }
  await clientA.auth.signOut();
  await clientB.auth.signOut();
});

// ─── tests ──────────────────────────────────────────────────

describe("RLS – project_ideas table", () => {
  it("User A can INSERT a project idea", async () => {
    const { data, error } = await clientA
      .from("project_ideas")
      .insert({
        user_id: userAId,
        title: "RLS Test Idea – please ignore",
        problem_statement: "Automated RLS integration test row.",
        tech_stack: { tags: ["Next.js"], urls: [] },
        variant: "prototype",
      })
      .select("id")
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    insertedIdeaId = data!.id;
  });

  it("User B CANNOT UPDATE User A's project idea", async () => {
    const { error, count } = await clientB
      .from("project_ideas")
      .update({ title: "Hijacked by User B" })
      .eq("id", insertedIdeaId);

    // RLS should either return a permission error or silently affect 0 rows
    const blocked = !!error || count === 0;
    expect(blocked).toBe(true);

    // Verify the title is unchanged
    const { data: row } = await clientA
      .from("project_ideas")
      .select("title")
      .eq("id", insertedIdeaId)
      .single();

    expect(row?.title).toBe("RLS Test Idea – please ignore");
  });

  it("User B CANNOT DELETE User A's project idea", async () => {
    const { error, count } = await clientB
      .from("project_ideas")
      .delete()
      .eq("id", insertedIdeaId);

    const blocked = !!error || count === 0;
    expect(blocked).toBe(true);

    // Row must still exist
    const { data: row } = await clientA
      .from("project_ideas")
      .select("id")
      .eq("id", insertedIdeaId)
      .single();

    expect(row).toBeDefined();
  });
});

describe("RLS – comments table", () => {
  it("User A can INSERT a root comment linked to the project idea", async () => {
    const { data, error } = await clientA
      .from("comments")
      .insert({
        project_id: insertedIdeaId,
        parent_id: null,
        content: "Root comment from User A (RLS test)",
        role: "poster",
        author: "Test User A",
      })
      .select("id")
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    rootCommentId = data!.id;
  });

  it("User B CAN INSERT a reply comment with parent_id referencing an existing comment", async () => {
    const { data, error } = await clientB
      .from("comments")
      .insert({
        project_id: insertedIdeaId,
        parent_id: rootCommentId,
        content: "Reply from User B (RLS test)",
        role: "student",
        author: "Test User B",
      })
      .select("id")
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();

    // Clean up the reply
    if (data) {
      await clientB.from("comments").delete().eq("id", data.id);
    }
  });
});
