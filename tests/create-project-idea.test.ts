import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock next/cache (revalidatePath) ────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ─── Mock next/headers (cookies, used by supabase server client) ──
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

// ─── Supabase mock plumbing ──────────────────────────────

const mockInsert = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({ insert: mockInsert })),
  })),
}));

// ─── Import the action under test AFTER mocks are set up ─
import { createProjectIdea, type PostFormState } from "@/components/post-form/actions";

// ─── Helpers ─────────────────────────────────────────────

/** Build a FormData object that mimics the PostForm submission. */
function buildFormData(overrides: Record<string, string> = {}): FormData {
  const defaults: Record<string, string> = {
    title: "Build a collaborative code review platform",
    problemStatement:
      "Students lack a real-time tool for peer code reviews within their ITPM groups.",
    variant: "prototype",
    techStacks: JSON.stringify(["Next.js", "Supabase"]),
    urls: JSON.stringify([]),
  };

  const merged = { ...defaults, ...overrides };
  const fd = new FormData();
  for (const [key, value] of Object.entries(merged)) {
    fd.set(key, value);
  }
  return fd;
}

const initialState: PostFormState = { ok: false };

// ─── Tests ───────────────────────────────────────────────

describe("createProjectIdea server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── SUCCESS ────────────────────────────────────────────

  describe("Success path", () => {
    it("inserts a valid row into project_ideas and returns ok: true", async () => {
      // Arrange — authenticated user + successful DB insert
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-abc-123" } },
        error: null,
      });
      mockInsert.mockResolvedValue({ error: null });

      const formData = buildFormData();

      // Act
      const result = await createProjectIdea(initialState, formData);

      // Assert — action succeeded
      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.message).toBe("Project idea submitted successfully!");
        expect(result.insertedRow).toEqual({
          user_id: "user-abc-123",
          title: "Build a collaborative code review platform",
          problem_statement:
            "Students lack a real-time tool for peer code reviews within their ITPM groups.",
          tech_stack: {
            tags: ["Next.js", "Supabase"],
            urls: [],
          },
          variant: "prototype",
        });
      }

      // Assert — Supabase insert was called with the right row
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "user-abc-123",
          title: "Build a collaborative code review platform",
          variant: "prototype",
        }),
      );
    });
  });

  // ── FAILURE — validation ───────────────────────────────

  describe("Failure path — validation errors", () => {
    it("returns field errors when title is empty", async () => {
      const formData = buildFormData({ title: "" });

      const result = await createProjectIdea(initialState, formData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.fieldErrors?.title).toBeDefined();
        expect(result.fieldErrors!.title!.length).toBeGreaterThan(0);
      }

      // Supabase should never be called
      expect(mockGetUser).not.toHaveBeenCalled();
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("returns field errors when title is too short", async () => {
      const formData = buildFormData({ title: "Short" });

      const result = await createProjectIdea(initialState, formData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.fieldErrors?.title).toContain(
          "Title must be at least 10 characters",
        );
      }
    });

    it("returns field errors when variant is missing", async () => {
      const formData = buildFormData({ variant: "" });

      const result = await createProjectIdea(initialState, formData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.fieldErrors?.variant).toBeDefined();
      }
    });
  });

  // ── FAILURE — authentication ───────────────────────────

  describe("Failure path — missing user session", () => {
    it("returns an auth error when no user is signed in", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const formData = buildFormData();

      const result = await createProjectIdea(initialState, formData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.formError).toBe(
          "You must be signed in to submit a project idea.",
        );
      }

      // insert should never be called
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("returns an auth error when getUser returns an error", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: "JWT expired" },
      });

      const formData = buildFormData();

      const result = await createProjectIdea(initialState, formData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.formError).toBe(
          "You must be signed in to submit a project idea.",
        );
      }
    });
  });

  // ── FAILURE — database ──────────────────────────────────

  describe("Failure path — database insert error", () => {
    it("returns a user-friendly error when the DB insert fails", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-abc-123" } },
        error: null,
      });
      mockInsert.mockResolvedValue({
        error: { message: "duplicate key value violates unique constraint" },
      });

      const formData = buildFormData();

      const result = await createProjectIdea(initialState, formData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.formError).toBe(
          "Failed to save project idea. Please try again later.",
        );
      }
    });
  });
});
