# IdeaBridge — Idea & Guidance Module

> **SLIIT ITPM IT3040 | Semester 1 | Progress 1 Demo**  
> Member 2 — Akshayan | Branch: `member2-idea-guidance`

A Next.js 14 web module that enables students to **submit project ideas**, receive **recursive threaded feedback** from mentors and peers, and interact with **per-project guidance threads** — all with full Markdown support, syntax highlighting, and live client-side interactivity.

---

## Features

### Project Idea Form (`/posts/new`)
- Multi-field form: **Title**, **Problem Statement**, **Project Variant**, **URLs**, **Tech Stack tags**
- **Zod schema validation** — inline error messages per field, no page reload
- **Tag Picker** — multi-select pill buttons (Next.js, React, TypeScript, Supabase, etc.)
- **Dynamic URL list** — add/remove URL inputs dynamically
- Submit button disabled during processing (`useFormStatus`)
- Success banner with submitted JSON payload on valid form

### Feedback Threads (`/feedback`)
- **Live interactive** comment tree — post comments directly in the browser
- **Inline Reply forms** — click Reply on any comment to add a nested reply
- **Unlimited nesting depth** via recursive `buildCommentTree()` algorithm
- Role badges: 🟡 **Mentor** (amber) · 🔵 **OP** (blue) · **Student** (none)
- **Markdown rendered** comment bodies — bold, links, inline code, fenced code blocks
- **Syntax highlighting** on code blocks (Prism / oneLight theme)
- **Upvote** toggle (blue) and **Mark Accepted** toggle (green) per comment
- Real-time comment count stats

### Guidance Thread (`/guidance/[projectId]`)
- Dynamic route — works for any project ID
- Same interactive features as Feedback Thread (add, reply, upvote, accept)
- Comment **date stamps** shown on every entry
- Initial data fetched server-side (Server Component), interactions handled client-side

---

## Getting Started

```bash
npm install
npm run dev
```

> **Windows PowerShell users** — if you see "running scripts is disabled":
> ```bash
> npm.cmd run dev
> ```

The dev server starts at **http://localhost:3000** (or 3001 if 3000 is in use).

---

## Pages

| Route | Description |
|---|---|
| `http://localhost:3001/posts/new` | Submit a Project Idea (form + Zod validation) |
| `http://localhost:3001/feedback` | Interactive Feedback Thread (add/reply/upvote/accept) |
| `http://localhost:3001/guidance/1` | Guidance Thread for project ID `1` |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── posts/new/page.tsx                      ← Project Idea Form
│   ├── feedback/page.tsx                       ← Interactive Feedback Thread
│   └── guidance/[projectId]/
│       ├── page.tsx                            ← Server Component (fetches data)
│       └── InteractiveGuidanceClient.tsx       ← Client boundary wrapper
├── components/
│   ├── post-form/
│   │   ├── PostForm.tsx                        ← Form + demo action (Zod validation)
│   │   ├── PostFormClient.tsx                  ← Form UI (useFormState)
│   │   ├── TagPicker.tsx                       ← Multi-select tag picker
│   │   └── schema.ts                           ← Zod validation schema
│   ├── feedback-thread/
│   │   ├── InteractiveFeedback.tsx             ← Comment form + flat state management
│   │   ├── InteractiveCommentNode.tsx          ← Recursive node + Reply button
│   │   ├── CommentNode.tsx                     ← Original read-only node
│   │   ├── CommentNodeClient.tsx               ← Client wrapper
│   │   └── types.ts                            ← Types + buildCommentTree()
│   └── guidance-thread/
│       ├── InteractiveGuidance.tsx             ← Comment form + state management
│       ├── InteractiveGuidanceNode.tsx         ← Recursive node + Reply button
│       ├── GuidanceCommentNode.tsx             ← Original read-only node
│       └── data.ts                             ← Types + fetchCommentsByProjectId()
```

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.35 | App Router framework |
| React | 18 | UI + hooks |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3 | Styling |
| Zod | 3 | Form validation |
| react-markdown | — | Markdown rendering |
| remark-gfm | — | GFM support |
| react-syntax-highlighter | — | Code block highlighting |

---

## Key Business Rules

| Rule | Detail |
|---|---|
| **VR-1** | Title: required, min 10 characters |
| **VR-2** | Problem Statement: required |
| **VR-3** | Project Variant: required, one of 4 values |
| **VR-4** | URLs: optional, must be valid URL format |
| **RP-6** | New replies are nested under the clicked comment (`parent_id`) |
| **TM-2** | `buildCommentTree()` rebuilds the full tree on every state update |
| **DF-2** | Guidance: server fetches seed data → passed as props to client for interactivity |

---

## Documentation (`/docs`)

| File | Description |
|---|---|
| `Progress-1-UI-Business-Rules.md` | Full UI & business rules with screenshots |
| `Progress-1-UI-Business-Rules.docx` | Word document version (with embedded screenshots) |
| `demo_viva_prep.md` | Demo script, 13 viva Q&A, checklist, code locations |
| `screenshots/` | 16 UI state screenshots for PP1 documentation |
| `Assignment 3 - pp1.pdf` | Original SLIIT assignment brief |

---

## Demo Notes

- **No backend required** — validation and form submission run client-side (demo mode)
- **No database** — comment data is seeded mock data; new comments exist only in React state (lost on refresh)
- This branch (`member2-idea-guidance`) is scoped to the Idea & Guidance UI for Progress 1

---

## Repository

- **Org Repo:** [sneha-dhaya-IT/Ideabridge](https://github.com/sneha-dhaya-IT/Ideabridge)
- **Branch:** `member2-idea-guidance`
