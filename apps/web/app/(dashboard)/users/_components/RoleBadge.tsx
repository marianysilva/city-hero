import { Badge } from "@/components/atoms/Badge";

import { ROLE_BADGE_VARIANT, ROLE_LABEL, type Role } from "../_types";

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={ROLE_BADGE_VARIANT[role]}>{ROLE_LABEL[role]}</Badge>;
}
