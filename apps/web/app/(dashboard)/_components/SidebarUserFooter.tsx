"use client";

import { UserCircleIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCurrentUser } from "@/app/(dashboard)/users/_hooks/useCurrentUser";
import { ROLE_LABEL } from "@/app/(dashboard)/users/_types";

export default function SidebarUserFooter() {
  const { currentUser } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="px-3 py-3 border-t border-zinc-100">
      <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
        <UserCircleIcon className="w-8 h-8 text-zinc-400 flex-shrink-0" />

        <div className="min-w-0 flex-1">
          {currentUser ? (
            <>
              <p className="text-sm font-medium text-zinc-800 truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-xs text-zinc-400 truncate leading-tight">
                {ROLE_LABEL[currentUser.role]}
              </p>
            </>
          ) : (
            <>
              <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse mb-1.5" />
              <div className="h-2.5 w-16 bg-zinc-100 rounded animate-pulse" />
            </>
          )}
        </div>

        <button
          onClick={handleLogout}
          disabled={loading}
          title="Sair"
          className="flex-shrink-0 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
