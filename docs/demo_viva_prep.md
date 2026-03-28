# Demo & Viva Preparation — Idea Guidance Module (Member 2)

**Date:** March 28, 2026 | **Component:** Idea & Guidance Module

---

## 2-Minute Demo Script

### Step 1 — Project Idea Form (`/posts/new`)
1. Open `http://localhost:3001/posts/new`
2. Click **Submit Idea** without filling anything → show red inline errors for Title, Problem Statement, Variant
3. Type "test" in Title → show **"Title must be at least 10 characters"**
4. Fill the form:
   - Title: *Smart Campus IoT Monitoring System*
   - Problem Statement: *Universities lack real-time monitoring…*
   - Variant: **Prototype**
   - Add a URL: `https://github.com/example`
   - Click tags: **Next.js**, **TypeScript**, **Supabase**
5. Click **Submit Idea** → show the green success banner with submitted JSON

### Step 2 — Feedback Thread (`/feedback`)
1. Navigate to `http://localhost:3001/feedback`
2. Show the existing **recursive comment tree**: OP question → Mentor reply → OP reply → peer reply
3. Point out **role badges**: "OP" (blue), "Mentor" (amber), and indented nesting
4. Show **Markdown rendering**: bold text, inline `code`, syntax-highlighted code block
5. In the **"Add a Comment"** form: set name to your name, role to "Student", type a comment with `**bold**` text, click **Post Comment** → show it appears at the bottom of the tree
6. Click **Reply** on the OP's root comment → show the **inline reply form** expanding
7. Type a reply → click **Post Reply** → show it nested one level under
8. Click **Upvote** on a comment → show blue toggle; click **Mark Accepted** → show green toggle

### Step 3 — Guidance Thread (`/guidance/1`)
1. Navigate to `http://localhost:3001/guidance/1`
2. Show mentor code block with syntax highlighting and date stamps
3. Post a comment from the "Add Guidance Comment" form
4. Click Reply on Dr. Fernando's mentor comment → show inline reply form
5. Mention it uses a dynamic route: any `/guidance/[projectId]` URL works

---

## Viva Questions & Model Answers

### Q1: What is Zod and why do you use it instead of plain `if` checks?

**Answer:** Zod is a TypeScript-first schema validation library. Instead of writing manual `if (!title || title.length < 10)` checks, I define the schema once:
```ts
export const postFormSchema = z.object({
  title: z.string().trim().min(10, "Title must be at least 10 characters"),
  problem_statement: z.string().trim().min(1, "Problem statement is required"),
  variant: z.enum(["Research", "Prototype", "Capstone", "Mini-project"]),
});
```
Then call `postFormSchema.safeParse(data)` — it returns `{ success, data, error }`. This is type-safe, reusable, and auto-generates typed error messages. Much cleaner and less error-prone than manual checks.

---

### Q2: What is `useFormState` and how does it connect to your form action?

**Answer:** `useFormState` (from `react-dom`) is a React hook that wraps a server action (or client action) and manages the state returned from it. In my `PostFormClient.tsx`:
```ts
const [state, formAction] = useFormState(demoAction, { message: null, errors: {} });
```
- `state` holds the latest `{ message, errors }` returned by the action
- `formAction` is passed to `<form action={formAction}>`
- On submit, the action runs, returns new state, React re-renders with errors or success message

---

### Q3: What is `useFormStatus` and how does it prevent double submission?

**Answer:** `useFormStatus` is a React hook that reads the pending state of the closest parent `<form>`. In the submit button component:
```ts
const { pending } = useFormStatus();
<button disabled={pending}>{pending ? "Submitting…" : "Submit Idea"}</button>
```
While the form action is running, `pending` is `true`, so the button is disabled and shows "Submitting…". This prevents the user from clicking submit multiple times.

---

### Q4: Explain the tree building algorithm in `buildCommentTree()`.

**Answer:** Input is a **flat array** of comments. The algorithm builds a **nested tree** in O(n) time using two passes:

1. **Pass 1 — Index:** Loop through all comments, add each to a `Map<id, CommentNode>` with an empty `children: []` array.
2. **Pass 2 — Link:** Loop through the map. If a node's `parent_id` is in the map, push it into the parent's `children` array. Otherwise, it's a root node.

```ts
export function buildCommentTree(comments: Comment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];
  for (const c of comments) map.set(c.id, { ...c, children: [] });
  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id))
      map.get(node.parent_id)!.children.push(node);
    else roots.push(node);
  }
  return roots;
}
```
This runs in O(n) — only two linear passes regardless of depth.

---

### Q5: How does the Reply button add a nested comment?

**Answer:** Each `InteractiveCommentNode` has local state `showReplyForm` (boolean). Clicking "Reply" sets it to `true`, revealing the inline form. On "Post Reply", the component calls `onReply(content, node.id, role, author)` — a callback passed down from the parent `InteractiveFeedback`. That callback creates a new comment object with `parent_id = node.id` and appends it to the flat `comments` state array. On the next render, `buildCommentTree()` runs again and the new comment appears nested under the right parent.

---

### Q6: How does recursive rendering work in `InteractiveCommentNode`?

**Answer:** The component renders itself recursively for its children:
```tsx
{node.children.map((child) => (
  <InteractiveCommentNode
    key={child.id}
    node={child}
    depth={depth + 1}
    onReply={onReply}
    ...
  />
))}
```
Each level adds `ml-6 border-l-2 border-blue-100 pl-4` for indentation. React handles the recursion — there's no explicit stack. Unlimited depth is supported because each call is just a React component render.

---

### Q7: What is the difference between a Server Component and a Client Component in Next.js 14?

**Answer:**

| | Server Component | Client Component |
|---|---|---|
| **Directive** | None (default) | `"use client"` at top |
| **Runs** | Server only (Node.js) | Browser (hydrated) |
| **Can use hooks** | No | Yes (`useState`, `useEffect`) |
| **Can be async** | Yes | No |
| **Example in my code** | `guidance/[projectId]/page.tsx` (fetches data) | `InteractiveFeedback.tsx` (manages state) |

In my system: the guidance `page.tsx` is a Server Component that `await`s data, then passes it as props to the client `InteractiveGuidanceClient` for interactive features.

---

### Q8: How does `TagPicker` serialize selected tags for the form?

**Answer:** `TagPicker` maintains a `Set<string>` in `useState`. Each tag pill's `onClick` calls:
```ts
setSelected(prev => {
  const next = new Set(prev);
  next.has(tag) ? next.delete(tag) : next.add(tag);
  return next;
});
```
A hidden `<input type="hidden" name="tech_stack" value={JSON.stringify([...selected])} />` is kept in sync via `useEffect`. When the form submits, the hidden input's JSON string value is part of the `FormData`. The server action parses it with `JSON.parse`.

---

### Q9: Why is the feedback page a fully client-side component (`"use client"`)? Why not server-side?

**Answer:** The feedback page needs to manage **interactive state** that changes without a page reload:
- `useState` for the flat comments array (grows as user posts)
- `useState` for per-comment upvote/accept toggles
- Reply form open/close states per comment

Server Components can't use `useState` or handle events. Since the data for this page is seeded (mock data, no database), there's no server-side fetch needed, so the entire page being a Client Component is appropriate.

---

### Q10: What is `useCallback` and why do you use it in `InteractiveFeedback`?

**Answer:** `useCallback` memoizes a function reference. In `InteractiveFeedback`:
```ts
const addComment = useCallback((content, parentId, role, author) => {
  setComments(prev => [...prev, { id: ..., parent_id: parentId, ... }]);
}, [projectId]);
```
Without `useCallback`, a new `addComment` function reference would be created on every render. Since `addComment` is passed as a prop to every `InteractiveCommentNode`, each child would re-render unnecessarily. `useCallback` prevents this by returning the same function reference unless `projectId` changes.

---

### Q11: How does Markdown + syntax highlighting work in comment bodies?

**Answer:** I use three libraries:
1. **`react-markdown`** — renders the comment string as React elements from Markdown AST
2. **`remark-gfm`** — plugin enabling GitHub-Flavored Markdown (bold, links, tables, strikethrough)
3. **`react-syntax-highlighter` (Prism)** — handles the `code` renderer override

In the `components` override passed to `ReactMarkdown`:
```tsx
code({ className, children }) {
  const match = /language-(\w+)/.exec(className || "");
  if (match) return <SyntaxHighlighter style={oneLight} language={match[1]}>...</SyntaxHighlighter>;
  return <code className="rounded bg-blue-50 px-1">{children}</code>;
}
```
Fenced code blocks get syntax-highlighted; inline `code` gets a simple styled `<code>` tag.

---

### Q12: Where exactly is the Zod validation happening — client side or server side?

**Answer:** In the current demo build, validation happens **client-side** inside `demoAction` in `PostForm.tsx`:
```ts
async function demoAction(prevState: PostFormState, formData: FormData) {
  const result = postFormSchema.safeParse({ title, problem_statement, variant, ... });
  if (!result.success) {
    return { message: null, errors: result.error.flatten().fieldErrors };
  }
  return { message: "Project idea submitted successfully! (Demo mode)", errors: {} };
}
```
In the full production version, this same Zod schema runs in a **Next.js Server Action** (`actions.ts`) — so validation happens server-side before any database insert. The schema file (`schema.ts`) is shared between both.

---

### Q13: How does the inline reply form know which comment to nest the reply under?

**Answer:** Each `InteractiveCommentNode` receives its own `node.id`. When the user posts a reply, `onReply` is called with that specific `node.id` as `parentId`. The new comment object is:
```ts
{ id: `c-${Date.now()}`, parent_id: node.id, content, role, author }
```
This gets appended to the global flat array. On re-render, `buildCommentTree()` finds this comment has `parent_id === node.id`, so it pushes it into that node's `children` array — making it appear nested under exactly the comment the user replied to.

---

## Demo Day Checklist

- [ ] Dev server running: `npm run dev` → `http://localhost:3001`
- [ ] Open `/posts/new` → verify form loads
- [ ] Click Submit on empty form → verify three red error messages
- [ ] Type short title "test" → verify min-length error
- [ ] Fill full form → submit → verify green success banner + JSON
- [ ] Open `/feedback` → verify existing comment tree renders
- [ ] Post a new comment → verify it appears in the thread
- [ ] Click Reply on a comment → verify inline form expands
- [ ] Post a reply → verify it nests under the comment
- [ ] Toggle Upvote (blue) and Mark Accepted (green)
- [ ] Open `/guidance/1` → verify mentor comments with date stamps + code blocks
- [ ] Post a guidance comment → verify it appears
- [ ] Click Reply on Dr. Fernando's comment → verify inline form
- [ ] Be ready to show `schema.ts`, `buildCommentTree()`, `InteractiveFeedback.tsx`, `InteractiveCommentNode.tsx`

---

## New Files Added (Latest Update)

| File | Purpose |
|---|---|
| `src/components/feedback-thread/InteractiveFeedback.tsx` | Root comment form + flat state array management |
| `src/components/feedback-thread/InteractiveCommentNode.tsx` | Comment with Reply button + inline reply form |
| `src/components/guidance-thread/InteractiveGuidance.tsx` | Same as above for guidance thread |
| `src/components/guidance-thread/InteractiveGuidanceNode.tsx` | Same as above for guidance thread |
| `src/app/guidance/[projectId]/InteractiveGuidanceClient.tsx` | Client bridge between server page and interactive component |

---

## Key Code Locations for Viva

| Topic | File | Line(s) |
|---|---|---|
| Zod schema definition | `src/components/post-form/schema.ts` | All |
| Zod validation in action | `src/components/post-form/PostForm.tsx` | `demoAction` function |
| useFormState hook | `src/components/post-form/PostFormClient.tsx` | Top of component |
| useFormStatus hook | `src/components/post-form/PostFormClient.tsx` | `SubmitButton` sub-component |
| buildCommentTree algorithm | `src/components/feedback-thread/types.ts` | `buildCommentTree()` |
| Interactive state (add comment) | `src/components/feedback-thread/InteractiveFeedback.tsx` | `addComment` + `useState` |
| Reply form logic | `src/components/feedback-thread/InteractiveCommentNode.tsx` | `showReplyForm` + `handleReply` |
| Markdown + syntax highlight | `src/components/feedback-thread/InteractiveCommentNode.tsx` | `<ReactMarkdown>` block |
| Server → Client data pass | `src/app/guidance/[projectId]/page.tsx` → `InteractiveGuidanceClient.tsx` | Props pattern |
| TagPicker serialization | `src/components/post-form/TagPicker.tsx` | `hidden input` + `useEffect` |
