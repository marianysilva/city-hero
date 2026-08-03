"use client";

import { useTranslation } from "@city-hero/i18n";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/components/atoms/Badge";

interface StatusBadgeProps {
  active: boolean;
}

export function StatusBadge({ active }: StatusBadgeProps) {
  const { t } = useTranslation();

  if (active) {
    return (
      <Badge variant="green">
        <CheckCircleIcon className="w-3.5 h-3.5" /> {t("users.statusActive")}
      </Badge>
    );
  }
  return (
    <Badge variant="gray">
      <XCircleIcon className="w-3.5 h-3.5" /> {t("users.statusInactive")}
    </Badge>
  );
}
