"use client";

import { useTranslation } from "@city-hero/i18n";

import { Badge } from "@/components/atoms/Badge";

import { getRoleLabelShort, ROLE_BADGE_VARIANT, type Role } from "../_types";

export function RoleBadge({ role }: { role: Role }) {
  const { t } = useTranslation();
  return <Badge variant={ROLE_BADGE_VARIANT[role]}>{getRoleLabelShort(t, role)}</Badge>;
}
