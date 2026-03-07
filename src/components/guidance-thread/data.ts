import { createSupabaseServerClient } from "@/lib/supabase/server";

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

// ── Supabase fetch ───────────────────────────────────────────

/**
 * Fetch every comment that belongs to a given `project_id`,
 * ordered oldest-first so parent nodes are always seen before
 * their children when building the tree.
 */
export async function fetchCommentsByProjectId(
  projectId: string,
): Promise<CommentRow[]> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.warn("[fetchCommentsByProjectId] Supabase env vars not set");
    return [];
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("comments")
    .select("id, project_id, parent_id, content, role, author, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(
      "[fetchCommentsByProjectId] query failed:",
      error.message,
    );
    return [];
  }

  return data as CommentRow[];
}

// ── Recursive tree builder ───────────────────────────────────

/**
 * Transform a flat array of comment rows into an arbitrarily
 * nested tree by matching each row's `parent_id` to another
 * row's `id`.
 *
 * Algorithm (O(n)):
 *  1. Index every row in a Map keyed by `id`, adding an empty
 *     `children` array.
 *  2. Walk the map — push each node into its parent's
 *     `children` array, or into the `roots` list if it has
 *     no parent.
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
