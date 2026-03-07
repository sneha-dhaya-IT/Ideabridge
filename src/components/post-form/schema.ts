import { z } from "zod";

export const TECH_TAGS = [
  "Next.js",
  "React",
  "Tailwind CSS",
  "TypeScript",
  "Supabase",
  "PostgreSQL",
  "Prisma",
  "Node.js",
] as const;

const urlItem = z
  .string()
  .trim()
  .url("Each URL must be valid (e.g. https://…)");

export const PROJECT_VARIANTS = [
  "research",
  "prototype",
  "capstone",
  "mini-project",
] as const;

export const postFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .min(10, "Title must be at least 10 characters"),
  problemStatement: z
    .string()
    .trim()
    .min(1, "Problem statement is required"),
  urls: z.array(urlItem).default([]),
  techStacks: z.array(z.enum(TECH_TAGS)).default([]),
  variant: z.enum(PROJECT_VARIANTS, {
    message: "Please select a project variant",
  }),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

/** Row shape that maps 1-to-1 to the project_ideas Supabase table. */
export type ProjectIdeaInsert = {
  user_id: string;
  title: string;
  problem_statement: string;
  tech_stack: Record<string, unknown>;  // stored as JSONB in Supabase
  variant: string;
};
