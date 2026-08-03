"use client";

import { useTranslation } from "@city-hero/i18n";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";

interface UserSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  hasActiveQuery: boolean;
}

export function UserSearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  hasActiveQuery,
}: UserSearchBarProps) {
  const { t } = useTranslation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
      <div className="flex-1 relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <Input
          type="search"
          placeholder={t("users.searchPlaceholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Button type="submit" variant="secondary">
        {t("users.actionSearch")}
      </Button>
      {hasActiveQuery && (
        <button
          type="button"
          onClick={onClear}
          title={t("users.clearSearch")}
          className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
