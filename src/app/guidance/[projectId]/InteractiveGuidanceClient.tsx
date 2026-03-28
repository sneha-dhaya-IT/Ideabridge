"use client";

import type { CommentRow } from "@/components/guidance-thread/data";
import { InteractiveGuidance } from "@/components/guidance-thread/InteractiveGuidance";

type Props = {
  initialComments: CommentRow[];
  projectId: string;
};

export function InteractiveGuidanceClient({ initialComments, projectId }: Props) {
  return (
    <InteractiveGuidance
      initialComments={initialComments}
      projectId={projectId}
      currentUser="Akshayan"
    />
  );
}
