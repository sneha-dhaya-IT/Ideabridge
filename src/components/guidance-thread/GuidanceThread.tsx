import {
  fetchCommentsByProjectId,
  buildCommentTree,
} from "./data";
import { GuidanceCommentNode } from "./GuidanceCommentNode";

type GuidanceThreadProps = {
  projectId: string;
  /** Whether the current viewer is the original poster. */
  isOP?: boolean;
};

/**
 * Server Component — fetches all comments for a project from
 * Supabase, transforms them into a nested tree, and renders
 * them recursively via the client `GuidanceCommentNode`.
 */
export default async function GuidanceThread({
  projectId,
  isOP = false,
}: GuidanceThreadProps) {
  const rows = await fetchCommentsByProjectId(projectId);
  const tree = buildCommentTree(rows);

  if (tree.length === 0) {
    return (
      <p className="text-sm text-slateText">
        No guidance comments yet — be the first to reply!
      </p>
    );
  }

  return (
    <section className="space-y-4">
      {tree.map((root) => (
        <GuidanceCommentNode key={root.id} node={root} isOP={isOP} />
      ))}
    </section>
  );
}
