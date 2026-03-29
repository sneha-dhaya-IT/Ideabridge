import { fetchCommentsByProjectId } from "@/components/guidance-thread/data";
import { InteractiveGuidanceClient } from "./InteractiveGuidanceClient";

type PageProps = {
  params: { projectId: string };
};

export default async function GuidancePage({ params }: PageProps) {
  const initialComments = await fetchCommentsByProjectId(params.projectId);

  return (
    <main className="min-h-screen bg-slateLight px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-darkPrimary">
            Guidance Thread
          </h1>
          <p className="text-sm text-slateText">
            Interactive guidance for project{" "}
            <code className="rounded bg-goldPrimary/30 px-1 py-0.5 text-xs">
              {params.projectId}
            </code>{" "}
            — add comments, reply, and interact.
          </p>
        </div>

        <InteractiveGuidanceClient
          initialComments={initialComments}
          projectId={params.projectId}
        />
      </div>
    </main>
  );
}
