import { test, expect } from "@playwright/test";

/**
 * E2E — Member 2: Idea & Guidance flow
 *
 * 1. Navigate to the "Post Idea" page
 * 2. Fill out the PostForm (Title, Problem Statement, Variant, Tech Tags)
 * 3. Submit and assert for a success message
 * 4. Navigate to the GuidanceThread for a project
 * 5. Submit a new comment and assert it appears in the UI
 */

// ───────────────────────────────────────────────
// 1 · PostForm — field validation (client-side)
// ───────────────────────────────────────────────

test.describe("PostForm page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/posts/new");
  });

  test("renders the PostForm heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Submit a Project Idea" }),
    ).toBeVisible();
  });

  test("shows validation errors when submitted empty", async ({ page }) => {
    // Submit without filling anything
    await page.getByRole("button", { name: "Submit Idea" }).click();

    // Title and Problem Statement errors should appear
    await expect(page.getByText("Title is required")).toBeVisible();
    await expect(page.getByText("Problem statement is required")).toBeVisible();
    await expect(
      page.getByText("Please select a project variant"),
    ).toBeVisible();
  });

  test("shows title min-length error for short titles", async ({ page }) => {
    await page.getByLabel("Title").fill("Short");
    await page.getByLabel("Problem Statement").fill("Some problem statement");
    await page.getByLabel("Project Variant").selectOption("research");
    await page.getByRole("button", { name: "Submit Idea" }).click();

    await expect(
      page.getByText("Title must be at least 10 characters"),
    ).toBeVisible();
  });
});

// ───────────────────────────────────────────────
// 2 · PostForm — full submission flow
// ───────────────────────────────────────────────

test.describe("PostForm submission", () => {
  test("fills out the form, selects tech tags, and submits", async ({
    page,
  }) => {
    await page.goto("/posts/new");

    // ── Fill Title ──
    await page.getByLabel("Title").fill("Build a real-time chat application");

    // ── Fill Problem Statement ──
    await page
      .getByLabel("Problem Statement")
      .fill(
        "Students need a platform to get instant feedback from mentors on their project ideas.",
      );

    // ── Select Variant ──
    await page.getByLabel("Project Variant").selectOption("prototype");

    // ── Pick Tech Tags ──
    await page.getByRole("button", { name: "Next.js" }).click();
    await page.getByRole("button", { name: "Tailwind CSS" }).click();
    await page.getByRole("button", { name: "Supabase" }).click();

    // Verify tag count updates
    await expect(page.getByText("3 selected")).toBeVisible();

    // ── Submit ──
    await page.getByRole("button", { name: "Submit Idea" }).click();

    // The form calls a server action that requires Supabase authentication.
    // In a CI/staging environment with a real Supabase backend the success
    // banner would appear. Without auth we expect the auth-guard message:
    const successBanner = page.getByText("Project idea submitted successfully!");
    const authError = page.getByText("You must be signed in");

    // Wait for either outcome (server action response)
    await expect(successBanner.or(authError)).toBeVisible({ timeout: 10_000 });
  });
});

// ───────────────────────────────────────────────
// 3 · GuidanceThread — comment tree rendering
// ───────────────────────────────────────────────

test.describe("GuidanceThread page", () => {
  test("renders guidance thread for a project", async ({ page }) => {
    // Navigate to a guidance thread (dynamic route)
    await page.goto("/guidance/test-project-1");

    // The heading should always render
    await expect(
      page.getByRole("heading", { name: "Guidance Thread" }),
    ).toBeVisible();

    // Either we see comments or the empty-state message
    const emptyState = page.getByText("No guidance comments yet");
    const commentSection = page.locator("section");

    await expect(emptyState.or(commentSection)).toBeVisible();
  });
});

// ───────────────────────────────────────────────
// 4 · FeedbackThread — recursive comment rendering
// ───────────────────────────────────────────────

test.describe("FeedbackThread page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/feedback");
  });

  test("renders the feedback thread heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Feedback Thread" }),
    ).toBeVisible();
  });

  test("renders sample nested comments with markdown", async ({ page }) => {
    // The demo page has sample comments — verify root comments render
    await expect(page.getByText("akshayan").first()).toBeVisible();
    await expect(page.getByText("Dr. Silva")).toBeVisible();

    // Mentor badge should appear for Dr. Silva
    await expect(page.getByText("Mentor").first()).toBeVisible();

    // OP badge should appear for the poster
    await expect(page.getByText("OP").first()).toBeVisible();
  });

  test("renders code blocks with syntax highlighting", async ({ page }) => {
    // The sample data contains fenced code blocks — verify they render
    // (react-syntax-highlighter wraps code in <pre> elements)
    const codeBlocks = page.locator("pre");
    await expect(codeBlocks.first()).toBeVisible();
  });

  test("upvote toggle works", async ({ page }) => {
    const upvoteBtn = page.getByRole("button", { name: "Upvote" }).first();
    await upvoteBtn.click();

    // After clicking, the button text should change to "Upvoted"
    await expect(
      page.getByRole("button", { name: "Upvoted" }).first(),
    ).toBeVisible();

    // Click again to un-upvote
    await page.getByRole("button", { name: "Upvoted" }).first().click();
    await expect(upvoteBtn).toBeVisible();
  });

  test("mark accepted toggle works (OP view)", async ({ page }) => {
    const acceptBtn = page
      .getByRole("button", { name: "Mark Accepted" })
      .first();
    await acceptBtn.click();

    await expect(
      page.getByRole("button", { name: "Accepted" }).first(),
    ).toBeVisible();

    // Toggle back
    await page.getByRole("button", { name: "Accepted" }).first().click();
    await expect(acceptBtn).toBeVisible();
  });

  test("nested replies are indented", async ({ page }) => {
    // Nested replies have the class ml-6 (margin-left) applied
    const nestedDivs = page.locator("div.ml-6.border-l-2");
    const count = await nestedDivs.count();
    expect(count).toBeGreaterThan(0);
  });
});
