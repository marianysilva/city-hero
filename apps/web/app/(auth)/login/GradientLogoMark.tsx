"use client";

import { useTheme } from "@city-hero/design-system";

/**
 * Stand-in for the design system's `LogoMark` atom ("on-light" variant —
 * packages/design_system/src/atoms/LogoMark), same tokens and layout, but
 * not that component: it depends on expo-linear-gradient's `LinearGradient`,
 * which doesn't render under this app's Turbopack config (confirmed via
 * real-browser DOM inspection; Next's documented `turbopack.resolveExtensions`
 * fix for this exact class of problem didn't resolve it either — reverted
 * rather than leave dead config in place). Known gap to revisit; extracted
 * here (rather than left inline in the login page) since a forgot-password
 * or create-account admin page — both already stubbed as placeholders on
 * the login page — would otherwise be the second copy-paste of this block.
 */
export function GradientLogoMark() {
  const { colors } = useTheme();

  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-2xl"
      style={{
        backgroundImage: `linear-gradient(135deg, ${colors.brand[500]}, ${colors.civic.purple})`,
      }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-2xl">
        🦸
      </div>
    </div>
  );
}
