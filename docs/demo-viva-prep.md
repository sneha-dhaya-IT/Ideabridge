# Demo & Viva Preparation — Idea & Guidance Module

**Component:** Idea & Guidance (Member 2)  
**Date:** March 28, 2026  
**Duration:** ~2–3 minutes demo + viva Q&A

---

## 1. Demo Script (Step-by-Step)

### Step 1: Project Idea Form (~45 seconds)

1. Open **http://localhost:3000/posts/new**
2. **Show empty form** — point out: Title, Problem Statement, Variant dropdown, URLs, Tag Picker
3. **Trigger validation** — click "Submit Idea" with empty fields
   - Show: "Title is required", "Problem statement is required", "Please select a project variant"
4. **Show min-length** — type "test" in Title → submit → "Title must be at least 10 characters"
5. **Fill valid data:**
   - Title: "Smart Campus IoT Monitoring System for Universities"
   - Problem: "Universities lack real-time monitoring of campus infrastructure..."
   - Variant: Prototype
   - Tags: Next.js, React, TypeScript, Supabase
6. **Submit** → Show green success banner with JSON output
7. **Explain:** "I'm using Zod for schema-based validation — same schema for client and server."

### Step 2: Interactive Feedback Thread (~45 seconds)

1. Navigate to **http://localhost:3000/feedback**
2. **Show the comment tree** — OP comment at top, mentor reply with amber badge, nested student comments
3. **Point out the code blocks** — syntax highlighting with Prism
4. **Demo "Add a Comment"** — type a new comment as a Mentor, click Post Comment
5. **Demo "Reply"** — click Reply on any comment → show inline reply form → post reply → show it nests properly
6. **Upvote** a comment → show blue "Upvoted" state
7. **Accept** a comment → show green "Accepted" state
8. **Explain:** "Comments are stored in React state. I use a `buildCommentTree()` O(n) algorithm to convert a flat array into a recursive tree."

### Step 3: Interactive Guidance Thread (~30 seconds)

1. Navigate to **http://localhost:3000/guidance/1**
2. **Show guidance thread** — mentor comments with dates, code blocks, nested replies
3. **Demo "Add Guidance Comment"** — post a new comment
4. **Demo Reply** on a mentor comment
5. **Explain:** "Same recursive tree structure as feedback but with date stamps and project-specific routing via `/guidance/[projectId]`."

### Step 4: Closing (~15 seconds)

- "All 3 pages share the same component architecture: Zod validation, recursive tree rendering, and interactive client-side state."
- "The code is well-structured with separated Server and Client Components."

---

## 2. Viva Questions & Answers

### Q1: What validation library are you using and why?
**A:** Zod — a TypeScript-first schema validation library. Defined in `src/components/post-form/schema.ts`. I use `postFormSchema.safeParse(data)` — it returns `{ success, data, error }` without throwing exceptions. Benefits: type inference, composable schemas, works on both client and server.

### Q2: How does the form validation work on the frontend?
**A:** In `PostForm.tsx`, the `demoAction` function calls `postFormSchema.safeParse()` on the form data. If it fails, the errors are returned with field paths (e.g., `errors.title`, `errors.problem_statement`). In `PostFormClient.tsx`, `useFormState` holds the state, and errors are rendered inline below each field.

### Q3: How does the Tag Picker work?
**A:** In `TagPicker.tsx`, I use a `Set<string>` in `useState`. Clicking a tag toggles it in/out of the Set. The selected tags are serialized to JSON and stored in a hidden `<input>` field so they're included in form submission. A counter shows "N selected" in real-time.

### Q4: How do you build the comment tree from a flat array?
**A:** In `types.ts`, `buildCommentTree()` uses a two-pass O(n) algorithm:
- **Pass 1:** Create a `Map<id, CommentNode>` indexing every comment with an empty `children` array.
- **Pass 2:** For each node, if `parent_id` exists and maps to a parent, push it to `parent.children`. Otherwise, it's a root node.
- Orphan comments (invalid `parent_id`) are promoted to roots for resilience.

### Q5: How does the interactive comment system work?
**A:** In `InteractiveFeedback.tsx`, all comments are stored in `useState<Comment[]>`. When a user posts a comment or reply:
1. A new `Comment` object is created with a unique `id` (using `Date.now()`) and the appropriate `parent_id`
2. It's appended to the flat array via `setComments(prev => [...prev, comment])`
3. React re-renders → `buildCommentTree(comments)` rebuilds the tree → UI updates

### Q6: How does the Reply functionality work?
**A:** Each `InteractiveCommentNode` has a `showReplyForm` state (boolean). Clicking "Reply" toggles it. The reply form includes name, role selector, and textarea. On submit, it calls `onReply(replyText, node.id, replyRole, replyAuthor)` — which sets `parent_id` to the current comment's `id`, making it a child. The form auto-closes and the reply appears indented under the parent.

### Q7: What is Server vs Client Component in your code?
**A:**
- **Server Components** (no `"use client"`): `GuidancePage` (page.tsx) — runs on the server, fetches data via `await fetchCommentsByProjectId()`.
- **Client Components** (`"use client"`): `InteractiveFeedback.tsx`, `InteractiveCommentNode.tsx` — use React hooks (`useState`, `useCallback`) for interactivity.
- The pattern: Server Component fetches data → passes to Client Component via props.

### Q8: How does the upvote/accept work technically?
**A:** Each `InteractiveCommentNode` has two independent `useState<boolean>` hooks — `upvoted` and `accepted`. Clicking toggles the state. The button styling changes via conditional classes (e.g., `upvoted ? "bg-blue-800 text-white" : "border-blue-200 text-blue-700"`). `aria-pressed` is set for accessibility.

### Q9: Why are upvote and accept client-side only?
**A:** For Progress 1, we focus on UI and business rules. In the full system, these would call a server action or API to persist the state in Supabase. The UI logic and validation remain the same — only the handler changes.

### Q10: How is the URL list managed dynamically?
**A:** In `PostFormClient.tsx`, `urls` is a `string[]` in `useState`. "+ Add another URL" pushes an empty string. The "x" button splices it. Non-empty URLs are serialized as JSON in a hidden input. Each URL is validated by Zod's `.url()` schema.

### Q11: What CSS framework do you use?
**A:** Tailwind CSS — a utility-first framework. Instead of writing custom `.card` classes, I compose utilities like `rounded-lg border border-blue-100 bg-white p-4 shadow-sm`. Benefits: no CSS file bloat, consistent design tokens, and responsive-first.

### Q12: How does the dynamic routing work for guidance?
**A:** Next.js App Router uses folder-based routing. The folder `guidance/[projectId]` creates a dynamic route. The `projectId` parameter is available via `params.projectId` in the server component. I pass it to the client component via `InteractiveGuidanceClient`, which uses it for fetching data and constructing new comment IDs.

### Q13: How does Markdown rendering work in comments?
**A:** I use `react-markdown` with `remark-gfm` plugin for GitHub-Flavored Markdown. For code blocks, I have a custom `code` renderer that checks for `language-xyz` class — if found, it uses `react-syntax-highlighter` with the Prism `oneLight` theme for syntax-highlighted rendering with proper coloring.

### Q14: What happens when you post a reply to a deeply nested comment?
**A:** The same `onReply` callback propagates up through all `InteractiveCommentNode` levels (passed as a prop). It always calls `setComments` at the top level in `InteractiveFeedback`. The flat array gets a new entry with the deep comment's `id` as `parent_id`. `buildCommentTree()` handles unlimited depth — the new reply slots into the correct position automatically.

### Q15: How is data flowing between Server and Client components?
**A:** On the Guidance page:
1. `page.tsx` (Server) calls `await fetchCommentsByProjectId(projectId)` to get initial data
2. Passes the `CommentRow[]` array to `InteractiveGuidanceClient` (Client) as props
3. `InteractiveGuidanceClient` passes to `InteractiveGuidance` which stores in `useState`
4. From that point, all new comments are managed entirely client-side

---

## 3. Key Code Locations

| Feature | File | Key Function/Component |
|---|---|---|
| Zod Schema | `src/components/post-form/schema.ts` | `postFormSchema` |
| Form Action | `src/components/post-form/PostForm.tsx` | `demoAction()` |
| Form UI | `src/components/post-form/PostFormClient.tsx` | `PostFormClient` |
| Tag Picker | `src/components/post-form/TagPicker.tsx` | `TagPicker` |
| Feedback State | `src/components/feedback-thread/InteractiveFeedback.tsx` | `InteractiveFeedback` |
| Feedback Comments | `src/components/feedback-thread/InteractiveCommentNode.tsx` | `InteractiveCommentNode` |
| Comment Tree | `src/components/feedback-thread/types.ts` | `buildCommentTree()` |
| Guidance State | `src/components/guidance-thread/InteractiveGuidance.tsx` | `InteractiveGuidance` |
| Guidance Comments | `src/components/guidance-thread/InteractiveGuidanceNode.tsx` | `InteractiveGuidanceNode` |
| Guidance Data | `src/components/guidance-thread/data.ts` | `fetchCommentsByProjectId()` |

---

## 4. Demo Day Checklist

- [ ] Run `npm run dev` before the presentation
- [ ] Test all 3 pages load: `/posts/new`, `/feedback`, `/guidance/1`
- [ ] Verify form validation triggers correctly
- [ ] Test posting a new comment on feedback page
- [ ] Test replying to an existing comment
- [ ] Test upvote and accept toggles
- [ ] Have the code open in VS Code for viva questions
- [ ] Know the key file locations (Section 3 above)
- [ ] Fill in your SLIIT registration number in the docs
