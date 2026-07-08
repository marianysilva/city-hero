"use client";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, active, onChange, className = "" }: TabsProps) {
  return (
    <div role="tablist" className={`flex border-b border-zinc-200 ${className}`}>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium
              border-b-2 -mb-px transition-colors
              ${
                isActive
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
              }
            `}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={`
                text-xs rounded-full px-1.5 py-0.5 font-medium tabular-nums
                ${isActive ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"}
              `}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
