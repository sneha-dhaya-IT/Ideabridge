"use client";

import { useState, useCallback } from "react";
import type { CommentRow, CommentTreeNode } from "./data";
import { buildCommentTree } from "./data";
import { InteractiveGuidanceNode } from "./InteractiveGuidanceNode";

type Props = {
  initialComments: CommentRow[];
  projectId: string;
  currentUser?: string;
};

export function InteractiveGuidance({
  initialComments,
  projectId,
  currentUser = "Akshayan",
}: Props) {
  const [comments, setComments] = useState<CommentRow[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [selectedRole, setSelectedRole] = useState<CommentRow["role"]>("student");
  const [authorName, setAuthorName] = useState(currentUser);

  const tree = buildCommentTree(comments);

  const addComment = useCallback(
    (content: string, parentId: string | null, role: CommentRow["role"], author: string) => {
      if (!content.trim()) return;
      const comment: CommentRow = {
        id: `gc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        project_id: projectId,
        parent_id: parentId,
        content: content.trim(),
        role,
        author,
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [...prev, comment]);
    },
    [projectId],
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
        className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-blue-950 mb-3">
          Add Guidance Comment
        </h2>

        <div className="flex gap-3 mb-3">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            className="w-40 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-950 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as CommentRow["role"])}
            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
          placeholder="Write a guidance comment... (Markdown supported: **bold**, `code`, ```code blocks```)"
          className="w-full resize-y rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-950 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-blue-500">
            Supports Markdown: **bold**, `inline code`, ```code blocks```
          </p>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Post Comment
          </button>
        </div>
      </form>

      {/* ── Comment tree ───────────────────────── */}
      {tree.length === 0 ? (
        <p className="text-sm text-blue-700">
          No guidance comments yet — be the first to reply!
        </p>
      ) : (
        <section className="space-y-4">
          {tree.map((root) => (
            <InteractiveGuidanceNode
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
      <div className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-xs text-blue-600">
        Total comments: <strong>{comments.length}</strong> · Tree roots:{" "}
        <strong>{tree.length}</strong>
      </div>
    </div>
  );
}
