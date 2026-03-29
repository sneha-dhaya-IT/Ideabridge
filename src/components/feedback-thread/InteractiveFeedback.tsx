"use client";

import { useState, useCallback } from "react";
import type { Comment } from "./types";
import { buildCommentTree } from "./types";
import { InteractiveCommentNode } from "./InteractiveCommentNode";

type Props = {
  initialComments: Comment[];
  currentUser?: string;
};

export function InteractiveFeedback({
  initialComments,
  currentUser = "akshayan",
}: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [selectedRole, setSelectedRole] = useState<Comment["role"]>("student");
  const [authorName, setAuthorName] = useState(currentUser);

  const tree = buildCommentTree(comments);

  const addComment = useCallback(
    (content: string, parentId: string | null, role: Comment["role"], author: string) => {
      if (!content.trim()) return;
      const comment: Comment = {
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        parent_id: parentId,
        content: content.trim(),
        role,
        author,
      };
      setComments((prev) => [...prev, comment]);
    },
    [],
  );

  const handleRootSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(newComment, null, selectedRole, authorName || currentUser);
    setNewComment("");
  };

  return (
    <div className="space-y-6">
      {/* ── New comment form ────────────────────── */}
      <form
        onSubmit={handleRootSubmit}
        className="rounded-xl border border-darkSecondary/10 bg-slateLight p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-darkPrimary mb-3">
          Add a Comment
        </h2>

        <div className="flex gap-3 mb-3">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            className="w-40 rounded-md border border-darkSecondary/20 bg-slateLight px-3 py-2 text-sm text-darkPrimary placeholder:text-slateText focus:outline-none focus:ring-2 focus:ring-goldPrimary/50"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Comment["role"])}
            className="rounded-md border border-darkSecondary/20 bg-slateLight px-3 py-2 text-sm text-darkPrimary focus:outline-none focus:ring-2 focus:ring-goldPrimary/50"
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="poster">OP (Poster)</option>
          </select>
        </div>

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          placeholder="Write a comment... (Markdown supported: **bold**, `code`, ```code blocks```)"
          className="w-full resize-y rounded-md border border-darkSecondary/20 bg-slateLight px-3 py-2 text-sm text-darkPrimary placeholder:text-slateText focus:outline-none focus:ring-2 focus:ring-goldPrimary/50"
        />

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slateText">
            Supports Markdown: **bold**, `inline code`, ```code blocks```
          </p>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="rounded-md bg-darkPrimary px-4 py-2 text-sm font-semibold text-goldPrimary transition-colors hover:bg-darkSecondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Post Comment
          </button>
        </div>
      </form>

      {/* ── Comment tree ───────────────────────── */}
      {tree.length === 0 ? (
        <p className="text-sm text-slateText">
          No comments yet — be the first to post!
        </p>
      ) : (
        <section className="space-y-4">
          {tree.map((root) => (
            <InteractiveCommentNode
              key={root.id}
              node={root}
              isOP
              onReply={addComment}
              defaultAuthor={authorName}
              defaultRole={selectedRole}
            />
          ))}
        </section>
      )}

      {/* ── Stats ──────────────────────────────── */}
      <div className="rounded-lg border border-darkSecondary/10 bg-slateLight px-4 py-3 text-xs text-slateText">
        Total comments: <strong>{comments.length}</strong> · Tree roots:{" "}
        <strong>{tree.length}</strong>
      </div>
    </div>
  );
}
