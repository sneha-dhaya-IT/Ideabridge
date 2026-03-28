// ── Row type matching the Supabase `comments` table ──────────

export type CommentRow = {
  id: string;
  project_id: string;
  parent_id: string | null;
  content: string;
  role: "student" | "mentor" | "poster";
  author: string;
  created_at: string;
};

export type CommentTreeNode = CommentRow & {
  children: CommentTreeNode[];
};

// ── Demo data fetch (no backend needed for presentation) ─────

/**
 * Returns demo/mock data for the guidance thread.
 * In production this would call Supabase.
 */
export async function fetchCommentsByProjectId(
  projectId: string,
): Promise<CommentRow[]> {
  // Return sample demo comments for presentation
  return [
    {
      id: "demo-1",
      project_id: projectId,
      parent_id: null,
      content:
        "Great project idea! I think you could refine the problem statement a bit more to clarify the target audience.",
      role: "mentor",
      author: "Dr. Fernando",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "demo-2",
      project_id: projectId,
      parent_id: "demo-1",
      content:
        "Thank you for the feedback! I've updated the problem statement to include specific user personas.",
      role: "poster",
      author: "Akshayan",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "demo-3",
      project_id: projectId,
      parent_id: null,
      content:
        "Consider adding **Next.js** server actions for the form submission. Here's a quick example:\n```ts\nexport async function submitIdea(formData: FormData) {\n  'use server';\n  // validate & insert\n}\n```",
      role: "mentor",
      author: "Mr. Perera",
      created_at: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: "demo-4",
      project_id: projectId,
      parent_id: "demo-3",
      content:
        "That's a great suggestion! I've implemented server actions with Zod validation.",
      role: "student",
      author: "Akshayan",
      created_at: new Date().toISOString(),
    },
  ];
}

// ── Recursive tree builder ───────────────────────────────────

/**
 * Transform a flat array of comment rows into an arbitrarily
 * nested tree by matching each row's `parent_id` to another
 * row's `id`.
 */
export function buildCommentTree(rows: CommentRow[]): CommentTreeNode[] {
  const map = new Map<string, CommentTreeNode>();
  const roots: CommentTreeNode[] = [];

  // Pass 1 — index
  for (const row of rows) {
    map.set(row.id, { ...row, children: [] });
  }

  // Pass 2 — link
  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
