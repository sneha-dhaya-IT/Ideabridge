"use client";

import type { Comment } from "@/components/feedback-thread/types";
import { InteractiveFeedback } from "@/components/feedback-thread/InteractiveFeedback";

/* ── Sample seed data ──────────────────────────── */
const sampleComments: Comment[] = [
  {
    id: "1",
    parent_id: null,
    content:
      "I keep getting a **hydration mismatch** when using `useEffect` inside a Server Component.\n\n```tsx\nexport default function Page() {\n  useEffect(() => { console.log('hi') }, []);\n  return <div>Hello</div>;\n}\n```\n\nAny ideas?",
    role: "poster",
    author: "akshayan",
  },
  {
    id: "2",
    parent_id: "1",
    content:
      'Server Components can\'t use hooks like `useEffect`. Add the `"use client"` directive at the top of the file, or extract the effect into a child Client Component.\n\nSee the [Next.js docs](https://nextjs.org/docs) for details.',
    role: "mentor",
    author: "Dr. Silva",
  },
  {
    id: "3",
    parent_id: "2",
    content: "That fixed it — thanks! Here's the updated version:\n\n```tsx\n\"use client\";\nimport { useEffect } from \"react\";\n\nexport default function Page() {\n  useEffect(() => { console.log('hi') }, []);\n  return <div>Hello</div>;\n}\n```",
    role: "poster",
    author: "akshayan",
  },
  {
    id: "4",
    parent_id: "1",
    content:
      "Had the same issue last week. Splitting into a server wrapper + client child is the cleanest pattern IMO.",
    role: "student",
    author: "kavindi",
  },
  {
    id: "5",
    parent_id: "4",
    content: "Agreed — composition over conversion!",
    role: "student",
    author: "hasitha",
  },
];

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-100 to-slateLight px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-darkPrimary">
            Feedback Threads
          </h1>
          <p className="text-sm text-slateText">
            Interactive comment tree — add comments, reply to existing ones,
            upvote, and mark accepted. Supports Markdown and code highlighting.
          </p>
        </div>

        <InteractiveFeedback
          initialComments={sampleComments}
          currentUser="akshayan"
        />
      </div>
    </main>
  );
}
