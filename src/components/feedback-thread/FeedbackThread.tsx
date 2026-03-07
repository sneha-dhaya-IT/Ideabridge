import type { Comment } from "./types";
import { buildCommentTree } from "./types";
import { CommentNodeClient } from "./CommentNodeClient";

type FeedbackThreadProps = {
  comments: Comment[];
  /** Whether the current viewer is the original poster. */
  isOP?: boolean;
};

/**
 * Server Component that builds a nested comment tree
 * from a flat array and delegates rendering to the
 * recursive client `CommentNode`.
 */
export default function FeedbackThread({
  comments,
  isOP = false,
}: FeedbackThreadProps) {
  const tree = buildCommentTree(comments);

  if (tree.length === 0) {
    return (
      <p className="text-sm text-blue-700">No comments yet — be the first!</p>
    );
  }

  return (
    <section className="space-y-4">
      {tree.map((root) => (
        <CommentNodeClient key={root.id} node={root} isOP={isOP} />
      ))}
    </section>
  );
}
