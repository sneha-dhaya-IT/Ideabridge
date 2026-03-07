"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import type { PostFormState } from "./actions";
import { TagPicker } from "./TagPicker";

type PostFormClientProps = {
  action: (prevState: PostFormState, formData: FormData) => Promise<PostFormState>;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Submitting…" : "Submit Idea"}
    </button>
  );
}

function UrlListInput({ errors }: { errors: string[] }) {
  const [urls, setUrls] = useState<string[]>([""]);
  const nonEmpty = useMemo(() => urls.filter((u) => u.trim() !== ""), [urls]);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <label className="text-sm font-medium text-blue-950">URLs</label>
        <span className="text-xs text-blue-700">{nonEmpty.length} added</span>
      </div>

      <input type="hidden" name="urls" value={JSON.stringify(nonEmpty)} />

      {urls.map((url, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              const next = [...urls];
              next[i] = e.target.value;
              setUrls(next);
            }}
            placeholder="https://…"
            className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-950 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {urls.length > 1 && (
            <button
              type="button"
              onClick={() => setUrls(urls.filter((_, j) => j !== i))}
              className="rounded-md border border-blue-200 px-2 text-sm text-red-600 hover:bg-red-50"
            >
              &times;
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => setUrls([...urls, ""])}
        className="text-sm font-medium text-blue-700 hover:text-blue-900"
      >
        + Add another URL
      </button>

      {errors.length > 0 ? (
        <p className="text-sm text-red-700">{errors[0]}</p>
      ) : null}
    </div>
  );
}

export function PostFormClient({ action }: PostFormClientProps) {
  const initialState: PostFormState = { ok: false };
  const [state, formAction] = useFormState(action, initialState);

  const titleErrors = state.ok ? [] : (state.fieldErrors?.title ?? []);
  const problemErrors = state.ok ? [] : (state.fieldErrors?.problemStatement ?? []);
  const urlErrors = state.ok ? [] : (state.fieldErrors?.urls ?? []);
  const variantErrors = state.ok ? [] : (state.fieldErrors?.variant ?? []);

  return (
    <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-blue-950">
          Submit a Project Idea
        </h1>
        <p className="text-sm text-blue-700">
          Fill in the details below. The server action validates with Zod,
          authenticates your session, and inserts into <code>project_ideas</code>.
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-6">
        {/* ── Title ───────────────────────────────────── */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-blue-950">
            Title
          </label>
          <input
            id="title"
            name="title"
            placeholder="Write a descriptive title (min 10 chars)"
            className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-950 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {titleErrors.length > 0 ? (
            <p className="text-sm text-red-700">{titleErrors[0]}</p>
          ) : null}
        </div>

        {/* ── Problem Statement ────────────────────────── */}
        <div className="space-y-2">
          <label
            htmlFor="problemStatement"
            className="text-sm font-medium text-blue-950"
          >
            Problem Statement
          </label>
          <textarea
            id="problemStatement"
            name="problemStatement"
            rows={6}
            placeholder="Explain the problem clearly and concisely"
            className="w-full resize-y rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-950 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {problemErrors.length > 0 ? (
            <p className="text-sm text-red-700">{problemErrors[0]}</p>
          ) : null}
        </div>

        {/* ── Variant ────────────────────────────────── */}
        <div className="space-y-2">
          <label htmlFor="variant" className="text-sm font-medium text-blue-950">
            Project Variant
          </label>
          <select
            id="variant"
            name="variant"
            defaultValue=""
            className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="" disabled>
              Select a variant…
            </option>
            <option value="research">Research</option>
            <option value="prototype">Prototype</option>
            <option value="capstone">Capstone</option>
            <option value="mini-project">Mini-project</option>
          </select>
          {variantErrors.length > 0 ? (
            <p className="text-sm text-red-700">{variantErrors[0]}</p>
          ) : null}
        </div>

        {/* ── URLs ────────────────────────────────────── */}
        <UrlListInput errors={urlErrors} />

        {/* ── Tech Tags ──────────────────────────────── */}
        <TagPicker name="techStacks" label="Tag Picker (Tech Stacks)" />

        {/* ── Form-level error ────────────────────────── */}
        {!state.ok && state.formError ? (
          <p className="text-sm text-red-700">{state.formError}</p>
        ) : null}

        <div className="flex items-center justify-between gap-4 border-t border-blue-100 pt-4">
          <p className="text-xs text-blue-700">
            Authenticated server action &rarr; Supabase insert &rarr; revalidatePath
          </p>
          <SubmitButton />
        </div>
      </form>

      {/* ── Success banner ────────────────────────────── */}
      {state.ok ? (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <h2 className="text-sm font-semibold text-green-900">
            {state.message}
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-md bg-white p-3 text-xs text-blue-950">
            {JSON.stringify(state.insertedRow, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
