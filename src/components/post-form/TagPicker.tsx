"use client";

import { useMemo, useState } from "react";

import { TECH_TAGS } from "./schema";

type TagPickerProps = {
  name: string;
  label: string;
  defaultValue?: string[];
};

export function TagPicker({ name, label, defaultValue }: TagPickerProps) {
  const defaultSelected = useMemo(() => new Set(defaultValue ?? []), [defaultValue]);
  const [selected, setSelected] = useState<Set<string>>(defaultSelected);

  const selectedArray = useMemo(() => Array.from(selected), [selected]);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <label className="text-sm font-medium text-blue-950">{label}</label>
        <span className="text-xs text-blue-700">{selectedArray.length} selected</span>
      </div>

      <input type="hidden" name={name} value={JSON.stringify(selectedArray)} />

      <div className="flex flex-wrap gap-2">
        {TECH_TAGS.map((tag) => {
          const isSelected = selected.has(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSelected((prev) => {
                  const next = new Set(prev);
                  if (next.has(tag)) next.delete(tag);
                  else next.add(tag);
                  return next;
                });
              }}
              className={
                "rounded-full border px-3 py-1 text-sm transition-colors " +
                (isSelected
                  ? "border-blue-800 bg-blue-800 text-white"
                  : "border-blue-200 bg-white text-blue-950 hover:bg-blue-50")
              }
              aria-pressed={isSelected}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-blue-700">
        Pick the tech stacks relevant to your post.
      </p>
    </div>
  );
}
