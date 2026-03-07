export type Comment = {
  id: string;
  parent_id: string | null;
  content: string;
  role: "student" | "mentor" | "poster";
  author: string;
};

export type CommentNode = Comment & {
  children: CommentNode[];
};

/** Build a tree from a flat array of comments keyed by parent_id. */
export function buildCommentTree(comments: Comment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const c of comments) {
    map.set(c.id, { ...c, children: [] });
  }

  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
