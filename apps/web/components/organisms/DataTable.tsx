"use client";

import { ChevronUpIcon, ChevronDownIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";

export type SortDir = "asc" | "desc";

export interface SortEntry {
  field: string;
  dir: SortDir;
}

export interface Column<T> {
  key: string;
  header: string;
  sortKey?: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyFn: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  sort?: SortEntry[];
  onSort?: (field: string, append: boolean) => void;
}

function SortIcon({
  dir,
  rank,
  multiSort,
}: {
  dir: SortDir | null;
  rank: number;
  multiSort: boolean;
}) {
  if (dir === null) {
    return <ChevronUpDownIcon className="w-3.5 h-3.5 text-zinc-300 shrink-0" />;
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-zinc-900">
      {dir === "asc" ? (
        <ChevronUpIcon className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <ChevronDownIcon className="w-3.5 h-3.5 shrink-0" />
      )}
      {multiSort && <span className="text-[10px] font-bold leading-none">{rank}</span>}
    </span>
  );
}

export function DataTable<T>({
  columns,
  rows,
  keyFn,
  loading = false,
  error,
  emptyMessage = "Nenhum resultado encontrado.",
  sort = [],
  onSort,
}: DataTableProps<T>) {
  if (loading || error || rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 flex items-center justify-center h-48">
        <span className={`text-sm ${error ? "text-red-500" : "text-zinc-400"}`}>
          {loading ? "Carregando..." : (error ?? emptyMessage)}
        </span>
      </div>
    );
  }

  const multiSort = sort.length > 1;

  return (
    <div>
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              {columns.map((col) => {
                const sortIndex = col.sortKey ? sort.findIndex((s) => s.field === col.sortKey) : -1;
                const activeSort = sortIndex >= 0 ? sort[sortIndex] : null;
                const isSortable = !!col.sortKey && !!onSort;

                const ariaSortValue = isSortable
                  ? activeSort
                    ? activeSort.dir === "asc"
                      ? ("ascending" as const)
                      : ("descending" as const)
                    : ("none" as const)
                  : undefined;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSortValue}
                    className={`
                      px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide
                      ${col.className ?? ""}
                    `}
                  >
                    {isSortable ? (
                      <button
                        onClick={(e) => onSort!(col.sortKey!, e.shiftKey)}
                        className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-zinc-900 transition-colors w-full"
                      >
                        {col.header}
                        <SortIcon
                          dir={activeSort?.dir ?? null}
                          rank={sortIndex + 1}
                          multiSort={multiSort}
                        />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1">{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <tr key={keyFn(row)} className="hover:bg-zinc-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pt-2 ml-1">
        <span className="text-xs text-zinc-400">
          Shift+clique nos cabeçalhos para ordenar por múltiplas colunas
        </span>
      </div>
    </div>
  );
}
