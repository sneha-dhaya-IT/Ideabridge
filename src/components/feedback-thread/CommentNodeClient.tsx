"use client";

import type { CommentNode as CommentNodeType } from "./types";
import { CommentNode } from "./CommentNode";

type Props = {
  node: CommentNodeType;
  isOP: boolean;
};

/**
 * Thin client wrapper so the server component can pass
 * the pre-built tree into the interactive CommentNode.
 */
export function CommentNodeClient({ node, isOP }: Props) {
  return <CommentNode node={node} isOP={isOP} />;
}
