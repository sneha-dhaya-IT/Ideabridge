/**
 * Captures screenshots of all UI pages for Progress 1 documentation.
 * Run with: npx tsx scripts/capture-screenshots.ts
 */
import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

const BASE = "http://localhost:3001";
const OUT = path.resolve(__dirname, "..", "screenshots");

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // Helper
  async function snap(page: any, name: string) {
    await page.screenshot({ path: path.join(OUT, name), fullPage: true });
    console.log(`  ✓ ${name}`);
  }

  // ── 01 PostForm empty ──
  console.log("Capturing PostForm screenshots...");
  let page = await ctx.newPage();
  await page.goto(`${BASE}/posts/new`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  await snap(page, "01-post-form-empty.png");

  // ── 02 PostForm validation errors ──
  await page.getByRole("button", { name: "Submit Idea" }).click();
  await page.waitForTimeout(500);
  await snap(page, "02-post-form-validation-errors.png");
  await page.close();

  // ── 03 PostForm filled with test data ──
  page = await ctx.newPage();
  await page.goto(`${BASE}/posts/new`, { waitUntil: "load" });
  await page.getByLabel("Title").fill("AI-Powered Peer Tutoring Matcher");
  await page
    .getByLabel("Problem Statement")
    .fill(
      "Many university students struggle to find qualified peer tutors for specific subjects. This platform uses AI to intelligently match students seeking help with peers who have demonstrated proficiency in those subjects, creating effective study partnerships.",
    );
  await page.getByLabel("Project Variant").selectOption("research");
  for (const tag of ["Next.js", "React", "TypeScript", "Tailwind CSS"]) {
    await page.getByRole("button", { name: tag, exact: true }).click();
  }
  await page
    .getByPlaceholder("https://")
    .fill("https://github.com/AK29-Shay/project");
  await page.getByRole("button", { name: "Add" }).click();
  await page.waitForTimeout(300);
  await snap(page, "03-post-form-filled.png");
  await page.close();

  // ── 04 PostForm short title error ──
  page = await ctx.newPage();
  await page.goto(`${BASE}/posts/new`, { waitUntil: "load" });
  await page.getByLabel("Title").fill("Short");
  await page
    .getByLabel("Problem Statement")
    .fill("Some problem statement here that is long enough.");
  await page.getByLabel("Project Variant").selectOption("prototype");
  await page.getByRole("button", { name: "Submit Idea" }).click();
  await page.waitForTimeout(500);
  await snap(page, "04-post-form-title-error.png");
  await page.close();

  // ── 05 Feedback Thread full ──
  console.log("Capturing Feedback Thread screenshots...");
  page = await ctx.newPage();
  await page.goto(`${BASE}/feedback`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  await snap(page, "05-feedback-thread-full.png");

  // ── 06 Upvoted comment ──
  await page.getByRole("button", { name: "Upvote", exact: true }).first().click();
  await page.waitForTimeout(300);
  await snap(page, "06-feedback-upvoted.png");
  await page.close();

  // ── 07 Accepted comment ──
  page = await ctx.newPage();
  await page.goto(`${BASE}/feedback`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Mark Accepted", exact: true }).first().click();
  await page.waitForTimeout(300);
  await snap(page, "07-feedback-accepted.png");
  await page.close();

  // ── 08 Upvote + Accept combined ──
  page = await ctx.newPage();
  await page.goto(`${BASE}/feedback`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  const mentorCard = page.locator("div.rounded-lg", { hasText: "Dr. Silva" }).first();
  await mentorCard.getByRole("button", { name: "Upvote", exact: true }).click();
  await page.waitForTimeout(200);
  await mentorCard.getByRole("button", { name: "Mark Accepted", exact: true }).click();
  await page.waitForTimeout(300);
  await snap(page, "08-feedback-upvote-and-accept.png");
  await page.close();

  // ── 09 Guidance Thread ──
  console.log("Capturing Guidance Thread screenshot...");
  page = await ctx.newPage();
  await page.goto(`${BASE}/guidance/test-project-1`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  await snap(page, "09-guidance-thread.png");
  await page.close();

  // ── 10 Home page ──
  console.log("Capturing Home page screenshot...");
  page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  await snap(page, "10-home-page.png");
  await page.close();

  await browser.close();
  console.log(`\nAll screenshots saved to: ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

