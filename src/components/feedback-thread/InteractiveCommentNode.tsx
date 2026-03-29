"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import type { CommentNode as CommentNodeType, Comment } from "./types";

type Props = {
  node: CommentNodeType;
  isOP: boolean;
  depth?: number;
  onReply: (content: string, parentId: string | null, role: Comment["role"], author: string) => void;
  defaultAuthor: string;
  defaultRole: Comment["role"];
};

export function InteractiveCommentNode({
  node,
  isOP,
  depth = 0,
  onReply,
  defaultAuthor,
  defaultRole,
}: Props) {
  const [upvoted, setUpvoted] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyAuthor, setReplyAuthor] = useState(defaultAuthor);
  const [replyRole, setReplyRole] = useState<Comment["role"]>(defaultRole);

  const isMentor = node.role === "mentor";

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(replyText, node.id, replyRole, replyAuthor || defaultAuthor);
    setReplyText("");
    setShowReplyForm(false);
  };

  return (
    <div
      className={
        "relative " + (depth > 0 ? "ml-6 border-l-2 border-darkSecondary/10 pl-4" : "")
      }
    >
      <div className="rounded-lg border border-darkSecondary/10 bg-slateLight p-4 shadow-sm">
        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-darkPrimary">
            {node.author}
          </span>

          {isMentor && (
            <span className="inline-flex items-center rounded-full bg-amberStart/20 px-2 py-0.5 text-xs font-medium text-amber-800">
              Mentor
            </span>
          )}

          {node.role === "poster" && (
            <span className="inline-flex items-center rounded-full bg-goldPrimary/30 px-2 py-0.5 text-xs font-medium text-darkSecondary">
              OP
            </span>
          )}
        </div>

        {/* ── Markdown body ──────────────────────── */}
        <div className="prose prose-sm prose-slate mt-2 max-w-none text-darkPrimary">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...rest }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");

                if (match) {
                  return (
                    <SyntaxHighlighter
                      style={oneLight}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md text-sm"
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  );
                }

                return (
                  <code
                    className="rounded bg-slateLight px-1 py-0.5 text-sm"
                    {...rest}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {node.content}
          </ReactMarkdown>
        </div>

        {/* ── Actions ────────────────────────────── */}
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setUpvoted((v) => !v)}
            className={
              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors " +
              (upvoted
                ? "border-goldPrimary bg-goldPrimary text-darkPrimary"
                : "border-darkSecondary/20 text-slateText hover:bg-slateLight")
            }
            aria-pressed={upvoted}
          >
            <UpvoteIcon />
            {upvoted ? "Upvoted" : "Upvote"}
          </button>

          {isOP && (
            <button
              type="button"
              onClick={() => setAccepted((v) => !v)}
              className={
                "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors " +
                (accepted
                  ? "border-emeraldStart bg-emeraldStart text-white"
                  : "border-darkSecondary/20 text-slateText hover:bg-slateLight")
              }
              aria-pressed={accepted}
            >
              <CheckIcon />
              {accepted ? "Accepted" : "Mark Accepted"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowReplyForm((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-darkSecondary/20 px-2 py-1 text-xs font-medium text-slateText transition-colors hover:bg-slateLight"
          >
            <ReplyIcon />
            {showReplyForm ? "Cancel" : "Reply"}
          </button>
        </div>

        {/* ── Reply form ─────────────────────────── */}
        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-3 space-y-2 border-t border-darkSecondary/10 pt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyAuthor}
                onChange={(e) => setReplyAuthor(e.target.value)}
                placeholder="Your name"
                className="w-32 rounded-md border border-darkSecondary/20 bg-slateLight/50 px-2 py-1.5 text-xs text-darkPrimary placeholder:text-slateText focus:outline-none focus:ring-2 focus:ring-goldPrimary/50"
              />
              <select
                value={replyRole}
                onChange={(e) => setReplyRole(e.target.value as Comment["role"])}
                className="rounded-md border border-darkSecondary/20 bg-slateLight/50 px-2 py-1.5 text-xs text-darkPrimary focus:outline-none focus:ring-2 focus:ring-goldPrimary/50"
              >
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
                <option value="poster">OP</option>
              </select>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              placeholder="Write a reply... (Markdown supported)"
              className="w-full resize-y rounded-md border border-darkSecondary/20 bg-slateLight/50 px-2 py-1.5 text-xs text-darkPrimary placeholder:text-slateText focus:outline-none focus:ring-2 focus:ring-goldPrimary/50"
              autoFocus
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="rounded-md bg-darkPrimary px-3 py-1.5 text-xs font-semibold text-goldPrimary transition-colors hover:bg-darkSecondary disabled:opacity-50"
              >
                Post Reply
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Recursive children ───────────────── */}
      {node.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {node.children.map((child) => (
            <InteractiveCommentNode
              key={child.id}
              node={child}
              isOP={isOP}
              depth={depth + 1}
              onReply={onReply}
              defaultAuthor={defaultAuthor}
              defaultRole={defaultRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tiny inline SVG icons ──────────────────── */

function UpvoteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M8 2.5l4 5H9v6H7v-6H4l4-5z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1-6.5 6.5z" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M6 3L1 7l5 4V8.5c4 0 7 1.5 8 5.5-1-4.5-4-7.5-8-8V3z" />
    </svg>
  );
}
