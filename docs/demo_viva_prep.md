# 🎯 PP1 Demo & Viva Preparation — Idea Guidance Module

> **Your module:** Idea & Guidance Component | **Time limit:** 2 minutes | **Worth:** 9% of unit marks

---

## 📋 Demo Flow (2 minutes)

### Suggested Script (practice this!)

**Step 1 — Post Form (40 sec)**
> "This is the Project Idea Submission form. Let me show the validations first."
1. Go to `http://localhost:3000/posts/new`
2. Click **Submit Idea** empty → show 3 validation errors (Title, Problem, Variant)
3. Type short title "test" → click Submit → show "Title must be at least 10 characters"
4. Fill everything properly → click Submit → show success banner with JSON data

**Step 2 — Feedback Thread (30 sec)**
> "Here is the Feedback thread — a recursive comment tree with Markdown and code highlighting."
1. Go to `/feedback`
2. Point out: **OP badge**, **Mentor badge**, nested replies, code syntax highlighting
3. Click **Upvote** → toggle blue state
4. Click **Mark Accepted** → toggle green state

**Step 3 — Guidance Thread (30 sec)**
> "And the Guidance thread page where mentors provide feedback on project ideas."
1. Go to `/guidance/1`
2. Show mentor comments with dates, nested student replies
3. Show code blocks rendering with syntax highlighting
4. Click Upvote/Accept

**Step 4 — Wrap up (20 sec)**
> "Tech stack: Next.js 14, React, TypeScript, Zod validation, Tailwind CSS. The comment tree uses a recursive O(n) algorithm to build nested comments from a flat array."

---

## 🧠 Viva Questions & Answers

### Q1: "What validation library are you using and why?"

> **Answer:** I'm using **Zod** for schema-based validation. It's defined in `schema.ts`. Zod gives type-safe validation — the schema defines rules like `min(10)` for the title, and it returns structured error objects with field-level messages. It integrates well with TypeScript because it infers types from the schema using `z.infer<typeof postFormSchema>`.

**Code location:** [schema.ts](file:///c:/Users/akshayan/Documents/sliit/itpm/project/src/components/post-form/schema.ts)

```ts
export const postFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").min(10, "Title must be at least 10 characters"),
  problemStatement: z.string().trim().min(1, "Problem statement is required"),
  urls: z.array(urlItem).default([]),
  techStacks: z.array(z.enum(TECH_TAGS)).default([]),
  variant: z.enum(PROJECT_VARIANTS, { message: "Please select a project variant" }),
});
```

---

### Q2: "How does the form submission work?"

> **Answer:** The form uses React's `useFormState` hook. When the user clicks Submit, the `formAction` runs the validation through the Zod schema using `safeParse()`. If validation fails, it returns `{ ok: false, fieldErrors: {...} }` and the error messages are displayed under each field. If it passes, it returns `{ ok: true }` with the data.

**Code location:** [PostForm.tsx](file:///c:/Users/akshayan/Documents/sliit/itpm/project/src/components/post-form/PostForm.tsx) (lines 20-47)

```ts
const parsed = postFormSchema.safeParse({
  title: formData.get("title"),
  problemStatement: formData.get("problemStatement"),
  // ...
});

if (!parsed.success) {
  const flattened = parsed.error.flatten();
  return { ok: false, fieldErrors: flattened.fieldErrors };
}
```

---

### Q3: "What is `useFormState` and `useFormStatus`?"

> **Answer:**
> - `useFormState` is a React hook that manages server/client action state. It takes an action function and initial state, returns current state and a form action. Each time the form submits, it calls the action with previous state and FormData.
> - `useFormStatus` gives the pending state of a form submission — I use it in the `SubmitButton` component to show "Submitting…" and disable the button while processing.

**Code location:** [PostFormClient.tsx](file:///c:/Users/akshayan/Documents/sliit/itpm/project/src/components/post-form/PostFormClient.tsx) (lines 4, 24-36, 91-93)

---

### Q4: "What is `'use client'` directive?"

> **Answer:** In Next.js 14, all components are **Server Components** by default. They render on the server and can't use hooks like `useState`, `useEffect`, or browser APIs. The `"use client"` directive marks a component as a **Client Component** — it runs in the browser and can use React hooks, event handlers, and manage interactive state. For example, `PostFormClient.tsx` and `CommentNode.tsx` need `"use client"` because they use `useState` for upvote/accept toggling.

---

### Q5: "How does the comment tree work?"

> **Answer:** I use a **two-pass O(n) algorithm** in `buildCommentTree()`:
> 1. **Pass 1 (Index):** Loop through the flat array of comments and store each in a `Map<string, CommentTreeNode>` keyed by `id`, with an empty `children` array
> 2. **Pass 2 (Link):** Loop through the map — if a node has a `parent_id`, push it into its parent's `children` array. If no parent, it's a root node.
>
> This builds a nested tree from flat data in O(n) time — no recursion needed for building.

**Code location:** [types.ts](file:///c:/Users/akshayan/Documents/sliit/itpm/project/src/components/feedback-thread/types.ts) (lines 14-31)

```ts
export function buildCommentTree(comments: Comment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];
  for (const c of comments) { map.set(c.id, { ...c, children: [] }); }     // Pass 1
  for (const node of map.values()) {                                         // Pass 2
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else { roots.push(node); }
  }
  return roots;
}
```

---

### Q6: "How does the recursive rendering work for nested comments?"

> **Answer:** The `CommentNode` component renders itself recursively. It displays the current comment's content, then if that comment has `children`, it maps over them and renders `<CommentNode>` again with `depth + 1`. The `depth` prop controls the left indentation (`ml-6`) and the border-left line.

**Code location:** [CommentNode.tsx](file:///c:/Users/akshayan/Documents/sliit/itpm/project/src/components/feedback-thread/CommentNode.tsx) (lines 124-135)

```tsx
{node.children.length > 0 && (
  <div className="mt-3 space-y-3">
    {node.children.map((child) => (
      <CommentNode key={child.id} node={child} isOP={isOP} depth={depth + 1} />
    ))}
  </div>
)}
```

---

### Q7: "How does Markdown rendering and code highlighting work?"

> **Answer:** I use `react-markdown` with the `remark-gfm` plugin for GitHub-flavored Markdown (bold, links, lists, etc.). For code blocks, I use a custom `code` component that checks if the className contains a language tag (like `language-tsx`). If it does, it renders with `SyntaxHighlighter` from `react-syntax-highlighter` using the `oneLight` theme. Inline code gets a simple blue background style.

**Code location:** [CommentNode.tsx](file:///c:/Users/akshayan/Documents/sliit/itpm/project/src/components/feedback-thread/CommentNode.tsx) (lines 52-84)

---

### Q8: "How does the TagPicker work?"

> **Answer:** It uses a `Set<string>` in `useState` to track selected tags. Clicking a tag toggles it (add/delete from Set). The selected tags are serialized as JSON into a hidden `<input>` field, so they get submitted with the form's `FormData`. The visual toggle is controlled by the `isSelected` check — selected tags get blue background, unselected get white.

**Code location:** [TagPicker.tsx](file:///c:/Users/akshayan/Documents/sliit/itpm/project/src/components/post-form/TagPicker.tsx)

---

### Q9: "What is the `PostFormState` discriminated union type?"

> **Answer:** It's a **TypeScript discriminated union** — the `ok` field acts as a discriminant:
> - `{ ok: false, fieldErrors?, formError? }` — validation failed
> - `{ ok: true, message, insertedRow }` — success
>
> This means TypeScript can narrow the type: when I check `state.ok`, it knows which properties are available.

```ts
type PostFormState =
  | { ok: false; fieldErrors?: Record<string, string[]>; formError?: string; }
  | { ok: true; message: string; insertedRow: Record<string, unknown>; };
```

---

### Q10: "What is the difference between Server Components and Client Components in your code?"

> **Answer:** 
> | | Server Component | Client Component |
> |---|---|---|
> | **Example** | `FeedbackThread.tsx`, `GuidanceThread.tsx` | `CommentNode.tsx`, `PostFormClient.tsx` |
> | **Runs on** | Server only | Browser (hydrated) |
> | **Can use hooks?** | ❌ No | ✅ Yes |
> | **Can be async?** | ✅ Yes (data fetching) | ❌ No |
> | **Directive** | Default (no directive) | `"use client"` |
>
> `GuidanceThread` is a Server Component — it fetches data and builds the tree. Then it passes the tree to `GuidanceCommentNode` (Client Component) which handles interactive state like upvote/accept.

---

### Q11: "What tech stack are you using?"

> **Answer:** **Next.js 14** (React framework with App Router), **React 18** (UI library), **TypeScript** (type safety), **Zod** (validation), **Tailwind CSS** (utility-first styling). For Markdown rendering: `react-markdown` + `remark-gfm` + `react-syntax-highlighter`.

---

### Q12: "Why did you separate PostForm and PostFormClient?"

> **Answer:** This follows the **server/client component composition pattern** in Next.js 14. `PostForm.tsx` handles the action logic and passes it as a prop to `PostFormClient.tsx` (the interactive form). This separation keeps the action logic separate from the UI rendering, and allows the Server Component to pass server actions to Client Components.

---

## 🚀 Demo Day Checklist

- [ ] Run `npm run dev` in the project folder before the demo
- [ ] Have browser ready at `http://localhost:3000/posts/new`
- [ ] Pre-fill some form data ready (use tips from the PDF: "you may populate forms with meaningful dummy data using button clicks")
- [ ] Bring HDMI convertor for projector
- [ ] Be at venue **10 minutes early**
- [ ] Practice the 2-minute script above at least 3 times
- [ ] Keep explanations short — the lecturer will interrupt at 2 minutes

---

## 📂 Project Structure (Know This!)

```
src/
├── app/
│   ├── layout.tsx          ← Root layout (Server Component)
│   ├── page.tsx            ← Home page
│   ├── globals.css         ← Global styles
│   ├── posts/new/page.tsx  ← Post form page
│   ├── feedback/page.tsx   ← Feedback thread page
│   └── guidance/[projectId]/page.tsx  ← Dynamic guidance page
├── components/
│   ├── post-form/
│   │   ├── PostForm.tsx       ← Wrapper (passes action to client)
│   │   ├── PostFormClient.tsx ← Interactive form (useFormState)
│   │   ├── TagPicker.tsx      ← Multi-select tag picker
│   │   └── schema.ts         ← Zod validation schema
│   ├── feedback-thread/
│   │   ├── FeedbackThread.tsx ← Server Component (builds tree)
│   │   ├── CommentNode.tsx    ← Recursive client renderer
│   │   ├── CommentNodeClient.tsx ← Client wrapper
│   │   └── types.ts           ← Types + tree builder algorithm
│   └── guidance-thread/
│       ├── GuidanceThread.tsx      ← Server Component
│       ├── GuidanceCommentNode.tsx ← Recursive client renderer
│       └── data.ts                ← Types + data fetch + tree builder
```

> [!TIP]
> **Key concept to remember:** "Flat data → O(n) tree builder → Recursive React components"
