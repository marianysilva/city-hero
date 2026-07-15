import React from "react";
import { ScrollView, Text, View } from "react-native";

import { useTheme } from "../hooks/useTheme";
import type { TypographyVariant } from "../tokens";

/**
 * Storybook landing page ("Getting Started > About"). Not a reusable UI
 * component — lives next to the other Storybook-only doc pages, same
 * pattern as tokens/TokensPreview.tsx.
 *
 * Typography uses inline styles (not `text-*` Tailwind classes) because
 * tailwind.preset.js only maps colors/spacing/radius/shadows/fontFamily to
 * utilities today, not a `fontSize` scale — see Button.tsx for the same
 * pattern in a real atom.
 */

const TIERS: Array<{ name: string; lives: string; examples: string }> = [
  { name: "Tokens", lives: "src/tokens/", examples: "colors, typography, spacing, radii, shadows" },
  { name: "Atoms", lives: "src/atoms/", examples: "Button, IconButton, Badge, Switch, Avatar" },
  { name: "Molecules", lives: "src/molecules/", examples: "FilterChipRow, StatsRow, EmptyState" },
  { name: "Organisms", lives: "src/organisms/", examples: "FeedCard, BottomNav, DetailHero" },
  { name: "Templates", lives: "src/templates/", examples: "DetailShell, ScreenContainer" },
];

const STEPS = [
  "Create src/<tier>/<Name>/<Name>.tsx per the tier rules below.",
  "Add a sibling <Name>.stories.tsx covering variants, states, and edge cases.",
  "Re-export it from src/index.ts.",
  "Add a row to docs/engineering/component-inventory.md.",
];

function textStyle(variant: TypographyVariant) {
  return {
    fontSize: variant.fontSize,
    lineHeight: variant.lineHeight,
    fontWeight: variant.fontWeight,
  };
}

export function About() {
  const { typography, colors, spacing } = useTheme();

  return (
    <ScrollView contentContainerStyle={{ gap: spacing["3xl"], padding: spacing.xl }}>
      <View className="gap-2">
        <Text style={[textStyle(typography.display), { color: colors.brand[600] }]}>
          CityHero Design System
        </Text>
        <Text style={textStyle(typography.body)} className="text-slate-500">
          The single source of truth for how CityHero's UI is composed — shared across the citizen
          app (Expo/React Native) and the manager dashboard (Next.js). Every reusable piece lives
          here, has a Storybook story, and is consumed by screens through composition.
        </Text>
      </View>

      <View className="gap-3">
        <Text style={textStyle(typography.h2)} className="text-slate-900">
          Where to start
        </Text>
        <Text style={textStyle(typography.body)} className="text-slate-700">
          • Browse "Tokens/Overview" for every color, spacing, radius, shadow, and type value.
        </Text>
        <Text style={textStyle(typography.body)} className="text-slate-700">
          • Browse "Atoms/Button" for a full worked example: variants, sizes, and states.
        </Text>
        <Text style={textStyle(typography.body)} className="text-slate-700">
          • Read docs/engineering/design-system.md for the binding rules (composition over
          configuration, tokens-only styling, no data-fetching in components, etc.).
        </Text>
      </View>

      <View className="gap-3">
        <Text style={textStyle(typography.h2)} className="text-slate-900">
          Atomic-design tiers
        </Text>
        <View className="gap-2">
          {TIERS.map((tier) => (
            <View key={tier.name} className="flex-row gap-3 border-b border-slate-100 pb-2">
              <Text style={textStyle(typography.bodyBold)} className="w-24 text-brand-600">
                {tier.name}
              </Text>
              <View className="flex-1">
                <Text style={textStyle(typography.caption)} className="text-slate-400">
                  {tier.lives}
                </Text>
                <Text style={textStyle(typography.caption)} className="text-slate-600">
                  {tier.examples}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text style={textStyle(typography.h2)} className="text-slate-900">
          Adding a new component
        </Text>
        <View className="gap-1">
          {STEPS.map((step, i) => (
            <Text key={step} style={textStyle(typography.body)} className="text-slate-700">
              {i + 1}. {step}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
