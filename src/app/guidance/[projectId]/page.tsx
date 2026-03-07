import GuidanceThread from "@/components/guidance-thread/GuidanceThread";

type PageProps = {
  params: { projectId: string };
};

export default function GuidancePage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-blue-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-blue-950">
            Guidance Thread
          </h1>
          <p className="text-sm text-blue-700">
            Comments for project{" "}
            <code className="rounded bg-blue-100 px-1 py-0.5 text-xs">
              {params.projectId}
            </code>
          </p>
        </div>

        {/* Server Component — fetches + nests comments automatically */}
        <GuidanceThread projectId={params.projectId} isOP />
      </div>
    </main>
  );
}
