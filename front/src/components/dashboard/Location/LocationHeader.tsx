
"use client";

import { PlusIcon } from "lucide-react";

interface LocationHeaderProps {
  title: string;
  buttonText: string;
  onAdd?: () => void;
}

export default function LocationHeader({ title, buttonText, onAdd }: LocationHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h1>

      <button
        onClick={onAdd}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
      >
        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
        <span>{buttonText}</span>
      </button>
    </div>
  );
}