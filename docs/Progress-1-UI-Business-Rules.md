# Progress 1 — UI and Business Rules Document

**Module:** IT3040 – ITPM | Semester 1  
**Programme:** BSc (Hons) in Information Technology — Year 3  
**Date:** March 7, 2026

---

## Student Details

| Field | Value |
|---|---|
| **Student Name** | Akshayan |
| **Registration Number** | *(fill in your SLIIT reg. no.)* |
| **Responsible Component(s)** | Idea & Guidance Module (Member 2) |
| **Description** | A web module that lets students submit project ideas with validation, receive recursive threaded feedback from mentors and peers, and view guidance threads per project. |

---

## Component Summary

| # | UI Screen | Route | Screenshot |
|---|---|---|---|
| UI 1 | Project Idea Submission Form | `/posts/new` | `screenshots/01-post-form-empty.png` |
| UI 2 | Form Validation Error View | `/posts/new` (invalid submit) | `screenshots/02-post-form-validation-errors.png` |
| UI 3 | Feedback Thread (Comment Tree) | `/feedback` | `screenshots/05-feedback-thread-full.png` |
| UI 4 | Guidance Thread | `/guidance/[projectId]` | `screenshots/09-guidance-thread.png` |

---

## UI 1: Project Idea Submission Form (`/posts/new`)

**Screenshots:** `01-post-form-empty.png`, `03-post-form-filled.png`

### A) Access Control Rules

| # | Rule |
|---|---|
| AC-1 | Only authenticated (logged-in) students can submit a project idea. Unauthenticated users receive an error on submission. |
| AC-2 | The form page itself is publicly viewable, but the submit action requires a valid Supabase session. |

### B) Validation Rules (Input Constraints)

| # | Field | Rule |
|---|---|---|
| VR-1 | **Title** | Mandatory. Minimum 10 characters. Must be a non-empty string. |
| VR-2 | **Problem Statement** | Mandatory. Must be a non-empty string. |
| VR-3 | **Project Variant** | Mandatory. Must be one of: `research`, `prototype`, `capstone`, `mini-project`. |
| VR-4 | **Tech Stacks** | Mandatory. At least one tag must be selected. Allowed values: `Next.js`, `React`, `TypeScript`, `Tailwind CSS`, `Node.js`, `Python`, `Supabase`, `PostgreSQL`, `Prisma`, `Docker`. |
| VR-5 | **URLs** | Optional. Each entry must be a valid URL format. Duplicate URLs are allowed (no de-duplication enforced). |
| VR-6 | **All fields** | Validation is performed server-side using Zod schema. Client-side feedback is displayed inline under each invalid field. |

### C) Process / Workflow Rules

| # | Rule |
|---|---|
| WF-1 | User fills in form fields → clicks "Submit Idea" → server action validates with Zod → if valid, inserts row into `project_ideas` table in Supabase. |
| WF-2 | On successful submission, the home page (`/`) is revalidated and the user sees a success confirmation. |
| WF-3 | On validation failure, the form re-renders with inline error messages below each invalid field. Data already entered is preserved. |
| WF-4 | The submit button shows "Submitting…" and is disabled while the server action is in progress, preventing double submissions. |

### D) Data Consistency Rules

| # | Rule |
|---|---|
| DC-1 | Each submitted idea is stored with the authenticated user's ID (`user_id` from Supabase auth). |
| DC-2 | The `tech_stack` field is stored as a JSON array in the database. |
| DC-3 | The `variant` field is stored as one of the four allowed enum values. |

### E) Notification / System Response Rules

| # | Rule |
|---|---|
| NR-1 | On successful insert, a success message (`{ success: true }`) is returned and the page is revalidated. |
| NR-2 | On validation failure, individual field errors are displayed in red text beneath the respective input. |
| NR-3 | On server/database error, a generic error message is displayed to the user. |

---

## UI 2: Form Validation Error View (`/posts/new` — invalid submit)

**Screenshots:** `02-post-form-validation-errors.png`, `04-post-form-title-error.png`

### B) Validation Rules (Input Constraints)

| # | Scenario | Expected Behavior |
|---|---|---|
| VE-1 | All fields empty → Submit | Errors shown for: Title ("at least 10 characters"), Problem Statement ("Required"), Tech Stacks ("Select at least one"). |
| VE-2 | Title fewer than 10 characters | Error: "Title must be at least 10 characters." |
| VE-3 | No variant selected | Error: "Please select a project variant." |
| VE-4 | No tech stacks selected | Error: "Select at least one technology." |
| VE-5 | Invalid URL format entered | Error: URL-specific validation message. |

### F) System Response Rules

| # | Rule |
|---|---|
| SR-1 | Error messages appear inline in red (`text-red-600`) directly below each invalid field. |
| SR-2 | The form is not submitted when validation fails — no database write occurs. |
| SR-3 | Previously entered valid data is preserved when the form re-renders with errors. |

---

## UI 3: Feedback Thread — Comment Tree (`/feedback`)

**Screenshots:** `05-feedback-thread-full.png`, `06-feedback-upvoted.png`, `07-feedback-accepted.png`, `08-feedback-upvote-and-accept.png`

### A) Access Control Rules

| # | Rule |
|---|---|
| AC-3 | The feedback thread page is viewable by all users (public). |
| AC-4 | The **"Mark Accepted"** button is visible only to the Original Poster (OP). Other users cannot see or interact with it. |
| AC-5 | The **"Upvote"** button is available to all users viewing the thread. |

### B) Display Rules

| # | Rule |
|---|---|
| DR-1 | Comments are rendered as a recursive tree. Root comments appear at the top level; replies are indented with a left blue border (`border-l-2 border-blue-100`). |
| DR-2 | Nesting depth is unlimited — replies to replies render at increasing indentation. |
| DR-3 | **Mentor** comments display an amber badge (`bg-amber-100`, text "Mentor") next to the author name. |
| DR-4 | **OP** (Original Poster) comments display a blue badge (`bg-blue-100`, text "OP") next to the author name. |
| DR-5 | **Student** comments have no special badge. |
| DR-6 | Comment body supports full Markdown: bold, links, inline code, and fenced code blocks with syntax highlighting (Prism / oneLight theme). |

### C) Interaction Rules — Upvote Toggle

| # | Rule |
|---|---|
| UV-1 | Each comment has an "Upvote" button. Clicking it toggles the state to "Upvoted". |
| UV-2 | When upvoted, the button text changes to "Upvoted", `aria-pressed` changes from `false` to `true`, and the button background changes to blue (`bg-blue-800`). |
| UV-3 | Clicking "Upvoted" toggles back to the initial "Upvote" state (`aria-pressed="false"`, default styling). |
| UV-4 | Upvote state is maintained per-comment and is independent of other comments. |

### D) Interaction Rules — Accept Solution Toggle (OP Only)

| # | Rule |
|---|---|
| AS-1 | The "Mark Accepted" button appears only when `isOP={true}`. It is rendered on every comment in the thread. |
| AS-2 | Clicking "Mark Accepted" toggles the state to "Accepted" with `aria-pressed="true"` and a green background (`bg-green-700`). |
| AS-3 | Clicking "Accepted" toggles back to "Mark Accepted" (`aria-pressed="false"`, default styling). |
| AS-4 | Both Upvote and Accept can be active simultaneously on the same comment. They are independent toggles. |

### E) Data Consistency Rules

| # | Rule |
|---|---|
| DC-4 | Upvote and accept states are currently client-side only (React `useState`). They reset on page reload. |
| DC-5 | Comment data (author, role, content, parent_id) is passed as props from the server component. |

---

## UI 4: Guidance Thread (`/guidance/[projectId]`)

**Screenshot:** `09-guidance-thread.png`

### A) Access Control Rules

| # | Rule |
|---|---|
| AC-6 | The guidance thread page is accessible via dynamic route `/guidance/[projectId]`. Any user with the URL can view it. |
| AC-7 | Comments are fetched from the Supabase `comments` table filtered by `project_id`. |

### B) Display Rules

| # | Rule |
|---|---|
| DR-7 | The page heading reads "Guidance Thread" with the `projectId` displayed in a `<code>` tag in the subtitle. |
| DR-8 | If no comments exist for the given `projectId`, an empty state message is shown: "No guidance comments yet — be the first to reply!" |
| DR-9 | If comments exist, they are rendered as a recursive tree identical to the Feedback Thread structure (nested, indented, with role badges). |
| DR-10 | Each comment shows a `created_at` timestamp in addition to author and content. |

### C) Data Fetch Rules

| # | Rule |
|---|---|
| DF-1 | Comments are fetched server-side (async Server Component) using `fetchCommentsByProjectId()`. |
| DF-2 | Comments are ordered by `created_at` ascending to ensure parent nodes are processed before children when building the tree. |
| DF-3 | If Supabase environment variables are not configured, the function returns an empty array gracefully (no crash). |
| DF-4 | If the Supabase query fails, the error is logged to the server console and an empty array is returned. |

### D) Tree Building Rules

| # | Rule |
|---|---|
| TB-1 | The `buildCommentTree()` function converts a flat array of comments into a nested tree using an O(n) single-pass algorithm. |
| TB-2 | Comments with `parent_id: null` become root nodes. Comments with a valid `parent_id` are nested under their parent's `children` array. |
| TB-3 | Orphan comments (with a `parent_id` that doesn't match any existing comment) are promoted to root level. |

---

## Testing Evidence

### Unit Tests (Vitest)
- **7 tests** covering `createProjectIdea` server action: validation of all fields, Zod schema enforcement, Supabase integration error handling.

### E2E Tests (Playwright)
- **25 tests** across 8 describe blocks covering all 4 UIs:
  - PostForm field validation (3 tests)
  - PostForm submission with ITPM test data (2 tests)
  - FeedbackThread comment tree rendering (4 tests)
  - FeedbackThread Markdown rendering (4 tests)
  - FeedbackThread role badges (3 tests)
  - FeedbackThread upvote interaction (2 tests)
  - FeedbackThread accept solution toggle (4 tests)
  - GuidanceThread page rendering (3 tests)

### Version Control (Git)
- Repository: `https://github.com/AK29-Shay/project`
- Branch: `feature/member2-idea-guidance`
- Meaningful commits tracking each feature addition

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Full-stack React framework |
| React 18 | UI component library |
| TypeScript 5 | Type-safe development |
| Tailwind CSS 4 | Utility-first styling |
| Zod 4 | Schema validation (server-side) |
| Supabase (SSR) | Database + Authentication |
| Playwright | E2E automated testing |
| Vitest | Unit testing |
| Vercel | Cloud deployment |

---

## Deployment

- **Platform:** Vercel
- **GitHub Integration:** Auto-deploys from `feature/member2-idea-guidance` branch
- **Live URL:** https://project-fawn-six-84.vercel.app
