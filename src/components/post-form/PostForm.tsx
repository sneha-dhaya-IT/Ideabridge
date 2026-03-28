"use client";

import { PostFormClient } from "./PostFormClient";
import { postFormSchema } from "./schema";

// ── Client-side-only demo action (no backend needed) ──
async function demoAction(
  _prevState: unknown,
  formData: FormData,
) {
  // Parse JSON hidden fields
  function parseJson(fd: FormData, key: string) {
    try {
      return JSON.parse(fd.get(key)?.toString() ?? "[]");
    } catch {
      return [];
    }
  }

  const parsed = postFormSchema.safeParse({
    title: formData.get("title"),
    problemStatement: formData.get("problemStatement"),
    urls: parseJson(formData, "urls"),
    techStacks: parseJson(formData, "techStacks"),
    variant: formData.get("variant"),
  });

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    return {
      ok: false as const,
      fieldErrors: flattened.fieldErrors as Record<string, string[]>,
      formError: flattened.formErrors[0],
    };
  }

  // Simulate successful submit (no DB call)
  return {
    ok: true as const,
    message: "Project idea submitted successfully! (Demo mode)",
    insertedRow: {
      title: parsed.data.title,
      problem_statement: parsed.data.problemStatement,
      tech_stack: { tags: parsed.data.techStacks, urls: parsed.data.urls },
      variant: parsed.data.variant,
    },
  };
}

export default function PostForm() {
  return <PostFormClient action={demoAction} />;
}
