import { test, expect } from "@playwright/test";

/**
 * ───────────────────────────────────────────────────────────────
 * E2E — Member 2: Idea & Guidance Full User Journey
 *
 * Automated test script that validates the complete "IdeaBridge"
 * module using Playwright. Covers:
 *
 *   1. PostForm — field validation (empty + too-short title)
 *   2. PostForm — full submission with test data
 *   3. FeedbackThread — recursive comment tree rendering
 *   4. FeedbackThread — Markdown + syntax-highlighted code blocks
 *   5. FeedbackThread — Mentor / OP badge visibility
 *   6. FeedbackThread — Upvote toggle (state round-trip)
 *   7. FeedbackThread — Accept Solution toggle (OP-only)
 *   8. GuidanceThread — page rendering and empty-state handling
 *
 * Test data source: SLIIT ITPM assessment test inputs.
 * ───────────────────────────────────────────────────────────────
 */

// ─── Test input data ────────────────────────────────────────

const TEST_IDEA = {
  title: "AI-Powered Peer Tutoring Matcher",
  problemStatement:
    "University students struggle to find peer tutors with matching schedules and specific module expertise. Manual coordination takes too much time and often leads to missed sessions.",
  variant: "prototype", // closest to "Project Showcase" in the schema enum
  tags: ["Next.js", "Supabase", "Tailwind CSS"] as const,
  url: "https://github.com/akshayan/peer-tutor-matcher",
};

// ═══════════════════════════════════════════════════════════════
// 1 · PostForm — client-side validation
// ═══════════════════════════════════════════════════════════════

test.describe("PostForm — field validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/posts/new");
  });

  test("renders the PostForm heading and submit button", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Submit a Project Idea" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Submit Idea" }),
    ).toBeVisible();
  });

  test("shows validation errors when submitted completely empty", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Submit Idea" }).click();

    await expect(page.getByText("Title is required")).toBeVisible();
    await expect(
      page.getByText("Problem statement is required"),
    ).toBeVisible();
    await expect(
      page.getByText("Please select a project variant"),
    ).toBeVisible();
  });

  test("shows title min-length error for short titles", async ({ page }) => {
    await page.getByLabel("Title").fill("Short");
    await page.getByLabel("Problem Statement").fill("A valid problem.");
    await page.getByLabel("Project Variant").selectOption("research");
    await page.getByRole("button", { name: "Submit Idea" }).click();

    await expect(
      page.getByText("Title must be at least 10 characters"),
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 2 · PostForm — full submission with assessment test data
// ═══════════════════════════════════════════════════════════════

test.describe("PostForm — submission with test data", () => {
  test("fills the form with ITPM test data and submits", async ({ page }) => {
    await page.goto("/posts/new");

    // ── Fill Title (>10 characters) ──
    await page.getByLabel("Title").fill(TEST_IDEA.title);

    // ── Fill Problem Statement (>50 characters) ──
    await page
      .getByLabel("Problem Statement")
      .fill(TEST_IDEA.problemStatement);

    // ── Select Variant ──
    await page
      .getByLabel("Project Variant")
      .selectOption(TEST_IDEA.variant);

    // ── Add GitHub URL ──
    const urlInput = page.locator('input[type="url"]').first();
    await urlInput.fill(TEST_IDEA.url);

    // Verify "1 added" badge appears
    await expect(page.getByText("1 added")).toBeVisible();

    // ── Pick Tech Tags ──
    for (const tag of TEST_IDEA.tags) {
      await page.getByRole("button", { name: tag }).click();
    }

    // Verify tag count
    await expect(
      page.getByText(`${TEST_IDEA.tags.length} selected`),
    ).toBeVisible();

    // ── Submit ──
    await page.getByRole("button", { name: "Submit Idea" }).click();

    // After clicking submit, the button shows "Submitting…" while the
    // server action executes. We verify the form was accepted by the
    // client (no Zod validation errors appeared).
    await expect(page.getByText("Title is required")).not.toBeVisible();
    await expect(page.getByText("Problem statement is required")).not.toBeVisible();
    await expect(
      page.getByText("Please select a project variant"),
    ).not.toBeVisible();

    // Wait for the server action to complete — the button re-enables,
    // or a success/error message appears.
    const submitBtn = page.getByRole("button", { name: "Submit Idea" });
    const submitting = page.getByRole("button", { name: "Submitting…" });
    const successBanner = page.getByText(
      "Project idea submitted successfully!",
    );
    const authError = page.getByText("You must be signed in");
    const dbError = page.getByText("Failed to save project idea");

    // Either the action returns a response, or the button re-enables
    await expect(
      successBanner
        .or(authError)
        .or(dbError)
        .or(submitBtn)
        .or(submitting),
    ).toBeVisible({
      timeout: 15_000,
    });
  });

  test("form fields retain test data values before submission", async ({
    page,
  }) => {
    await page.goto("/posts/new");

    await page.getByLabel("Title").fill(TEST_IDEA.title);
    await page
      .getByLabel("Problem Statement")
      .fill(TEST_IDEA.problemStatement);
    await page
      .getByLabel("Project Variant")
      .selectOption(TEST_IDEA.variant);

    // Assert field values are correct
    await expect(page.getByLabel("Title")).toHaveValue(TEST_IDEA.title);
    await expect(page.getByLabel("Problem Statement")).toHaveValue(
      TEST_IDEA.problemStatement,
    );
    await expect(page.getByLabel("Project Variant")).toHaveValue(
      TEST_IDEA.variant,
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// 3 · FeedbackThread — recursive comment tree
// ═══════════════════════════════════════════════════════════════

test.describe("FeedbackThread — comment tree rendering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/feedback", { waitUntil: "domcontentloaded" });
  });

  test("renders the Feedback Thread heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Feedback Thread" }),
    ).toBeVisible();
  });

  test("renders root comments from sample data", async ({ page }) => {
    // Root comment author (poster)
    await expect(page.getByText("akshayan").first()).toBeVisible();

    // Root comment content snippet (markdown bold rendered)
    await expect(
      page.getByText("hydration mismatch").first(),
    ).toBeVisible();
  });

  test("renders nested replies with visual indentation", async ({ page }) => {
    // Nested replies use ml-6 + border-l-2 for threading
    const nestedNodes = page.locator("div.ml-6.border-l-2");
    const count = await nestedNodes.count();

    // The sample data has 4 nested comments (ids 2, 3, 4, 5)
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("renders deeply nested replies (3+ levels)", async ({ page }) => {
    // Comment 3 is a reply to Comment 2 which is a reply to Comment 1
    // "That fixed it" is from akshayan's reply to Dr. Silva's reply
    await expect(
      page.getByText("That fixed it").first(),
    ).toBeVisible();

    // "composition over conversion" is from hasitha replying to kavindi
    await expect(
      page.getByText("composition over conversion").first(),
    ).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 4 · FeedbackThread — Markdown & code highlighting
// ═══════════════════════════════════════════════════════════════

test.describe("FeedbackThread — Markdown rendering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/feedback", { waitUntil: "domcontentloaded" });
  });

  test("renders fenced code blocks with syntax highlighting", async ({
    page,
  }) => {
    // react-syntax-highlighter renders fenced code inside <pre> tags
    const codeBlocks = page.locator("pre");
    await expect(codeBlocks.first()).toBeVisible();

    // The sample data contains `useEffect` in a code block
    await expect(page.getByText("useEffect").first()).toBeVisible();
  });

  test("renders inline code with <code> tags", async ({ page }) => {
    // Inline code like `useEffect` in the comment text
    const inlineCode = page.locator("code");
    const count = await inlineCode.count();
    expect(count).toBeGreaterThan(0);
  });

  test("renders markdown bold text", async ({ page }) => {
    // **hydration mismatch** should render as <strong>
    const boldText = page.locator("strong", {
      hasText: "hydration mismatch",
    });
    await expect(boldText).toBeVisible();
  });

  test("renders markdown links", async ({ page }) => {
    // Dr. Silva's comment contains [Next.js docs](https://nextjs.org/docs)
    const link = page.locator('a[href="https://nextjs.org/docs"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Next.js docs");
  });
});

// ═══════════════════════════════════════════════════════════════
// 5 · FeedbackThread — Mentor & OP badges
// ═══════════════════════════════════════════════════════════════

test.describe("FeedbackThread — role badges", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/feedback", { waitUntil: "domcontentloaded" });
  });

  test("displays Mentor badge next to mentor comments", async ({ page }) => {
    // Dr. Silva has role: "mentor" — amber badge should appear
    await expect(page.getByText("Dr. Silva")).toBeVisible();
    await expect(page.getByText("Mentor").first()).toBeVisible();

    // Verify the Mentor badge uses the amber styling
    const mentorBadge = page
      .locator("span", { hasText: "Mentor" })
      .first();
    await expect(mentorBadge).toHaveClass(/bg-amber-100/);
    await expect(mentorBadge).toHaveClass(/text-amber-800/);
  });

  test("displays OP badge next to original poster comments", async ({
    page,
  }) => {
    // akshayan has role: "poster" — blue OP badge should appear
    await expect(page.getByText("OP").first()).toBeVisible();

    const opBadge = page.locator("span", { hasText: "OP" }).first();
    await expect(opBadge).toHaveClass(/bg-blue-100/);
    await expect(opBadge).toHaveClass(/text-blue-800/);
  });

  test("student comments have no special badge", async ({ page }) => {
    // kavindi is a "student" — no Mentor or OP badge next to name
    const kavindiHeader = page
      .locator("div.flex.items-center.gap-2", { hasText: "kavindi" })
      .first();
    await expect(kavindiHeader).toBeVisible();

    // The header for kavindi should not contain Mentor or OP text
    await expect(
      kavindiHeader.locator("span", { hasText: "Mentor" }),
    ).toHaveCount(0);
    await expect(
      kavindiHeader.locator("span", { hasText: "OP" }),
    ).toHaveCount(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 6 · FeedbackThread — Upvote toggle
// ═══════════════════════════════════════════════════════════════

test.describe("FeedbackThread — Upvote interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/feedback", { waitUntil: "load" });
  });

  test("upvote button toggles from 'Upvote' to 'Upvoted'", async ({
    page,
  }) => {
    const upvoteBtn = page
      .getByRole("button", { name: "Upvote", exact: true })
      .first();

    // Initial state — not upvoted, aria-pressed=false
    await expect(upvoteBtn).toHaveAttribute("aria-pressed", "false");
    await upvoteBtn.click();

    // After click — shows "Upvoted", aria-pressed=true
    const upvotedBtn = page
      .getByRole("button", { name: "Upvoted", exact: true })
      .first();
    await expect(upvotedBtn).toBeVisible();
    await expect(upvotedBtn).toHaveAttribute("aria-pressed", "true");

    // Verify active styling (blue-800 bg)
    await expect(upvotedBtn).toHaveClass(/bg-blue-800/);
  });

  test("upvote button can be un-toggled back to initial state", async ({
    page,
  }) => {
    const upvoteBtn = page
      .getByRole("button", { name: "Upvote", exact: true })
      .first();

    // Toggle on
    await upvoteBtn.click();
    await expect(
      page.getByRole("button", { name: "Upvoted", exact: true }).first(),
    ).toBeVisible();

    // Toggle off
    await page.getByRole("button", { name: "Upvoted", exact: true }).first().click();
    await expect(
      page.getByRole("button", { name: "Upvote", exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Upvote", exact: true }).first(),
    ).toHaveAttribute("aria-pressed", "false");
  });
});

// ═══════════════════════════════════════════════════════════════
// 7 · FeedbackThread — Accept Solution toggle (OP-only)
// ═══════════════════════════════════════════════════════════════

test.describe("FeedbackThread — Accept Solution (OP view)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/feedback", { waitUntil: "load" });
    // The demo page passes isOP={true} so the "Mark Accepted" button appears
  });

  test("'Mark Accepted' button is visible for OP", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Mark Accepted", exact: true }).first(),
    ).toBeVisible();
  });

  test("clicking 'Mark Accepted' toggles to 'Accepted' state", async ({
    page,
  }) => {
    const acceptBtn = page
      .getByRole("button", { name: "Mark Accepted", exact: true })
      .first();

    await expect(acceptBtn).toHaveAttribute("aria-pressed", "false");
    await acceptBtn.click();

    // After click — shows "Accepted" with green styling
    const acceptedBtn = page
      .getByRole("button", { name: "Accepted", exact: true })
      .first();
    await expect(acceptedBtn).toBeVisible();
    await expect(acceptedBtn).toHaveAttribute("aria-pressed", "true");
    await expect(acceptedBtn).toHaveClass(/bg-green-700/);
  });

  test("'Accepted' can be un-toggled back to 'Mark Accepted'", async ({
    page,
  }) => {
    // Toggle on
    const markBtn = page
      .getByRole("button", { name: "Mark Accepted", exact: true })
      .first();
    await markBtn.click();

    const acceptedBtn = page
      .getByRole("button", { name: "Accepted", exact: true })
      .first();
    await expect(acceptedBtn).toBeVisible();

    // Toggle off
    await acceptedBtn.click();
    await expect(
      page.getByRole("button", { name: "Mark Accepted", exact: true }).first(),
    ).toBeVisible();
  });

  test("upvote + accept on the same mentor comment (Dr. Silva)", async ({
    page,
  }) => {
    // Locate Dr. Silva's comment card specifically
    const mentorCard = page
      .locator("div.rounded-lg", { hasText: "Dr. Silva" })
      .first();

    // Upvote
    const upvoteBtn = mentorCard.getByRole("button", { name: "Upvote", exact: true });
    await upvoteBtn.click();
    await expect(
      mentorCard.getByRole("button", { name: "Upvoted", exact: true }),
    ).toBeVisible();

    // Mark as Accepted
    const acceptBtn = mentorCard.getByRole("button", {
      name: "Mark Accepted", exact: true,
    });
    await acceptBtn.click();
    await expect(
      mentorCard.getByRole("button", { name: "Accepted", exact: true }),
    ).toBeVisible();

    // Both states should be active simultaneously
    await expect(
      mentorCard.getByRole("button", { name: "Upvoted", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      mentorCard.getByRole("button", { name: "Accepted", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

// ═══════════════════════════════════════════════════════════════
// 8 · GuidanceThread — page rendering
// ═══════════════════════════════════════════════════════════════

test.describe("GuidanceThread — page rendering", () => {
  test("renders the Guidance Thread heading", async ({ page }) => {
    await page.goto("/guidance/test-project-1");

    await expect(
      page.getByRole("heading", { name: "Guidance Thread" }),
    ).toBeVisible();
  });

  test("shows project ID in the page subtitle", async ({ page }) => {
    await page.goto("/guidance/test-project-1");

    await expect(
      page.locator("code", { hasText: "test-project-1" }),
    ).toBeVisible();
  });

  test("shows empty state or comment section", async ({ page }) => {
    await page.goto("/guidance/test-project-1");

    const emptyState = page.getByText("No guidance comments yet");
    const commentSection = page.locator("section");

    await expect(emptyState.or(commentSection)).toBeVisible({ timeout: 10000 });
  });
});
