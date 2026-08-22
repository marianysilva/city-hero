import { useTheme } from "@city-hero/design-system";
import { useTranslation } from "@city-hero/i18n";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type PlaceholderScreenProps = {
  /** Screen name shown as the heading (already translated by the caller). */
  title: string;
  /** Large decorative glyph. */
  emoji?: string;
  /**
   * When provided, renders a "close" affordance — used by the full-screen
   * Camera modal, which has no bottom nav to navigate away with.
   */
  onClose?: () => void;
};

/**
 * A stand-in for a screen that hasn't been built yet. Every tab/route created
 * to wire up the bottom nav renders this until its real task
 * (06-home-map, 07-civic-feed, …) lands. Keeps the shell navigable and the
 * nav visible without pretending the underlying feature exists.
 */
export function PlaceholderScreen({ title, emoji = "🚧", onClose }: PlaceholderScreenProps) {
  const { colors, spacing, typography } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
        paddingTop: insets.top + spacing.xl,
      }}
    >
      {onClose ? (
        <Pressable
          testID="placeholder-close"
          accessibilityRole="button"
          accessibilityLabel={t("nav.closeMore")}
          onPress={onClose}
          hitSlop={12}
          style={{ position: "absolute", top: insets.top + spacing.md, right: spacing.lg }}
        >
          <Text style={{ fontSize: 24, color: colors.text.secondary }}>✕</Text>
        </Pressable>
      ) : null}

      <Text style={{ fontSize: 56 }} accessibilityElementsHidden importantForAccessibility="no">
        {emoji}
      </Text>
      <Text
        style={{
          marginTop: spacing.lg,
          color: colors.text.primary,
          fontSize: typography.h2.fontSize,
          lineHeight: typography.h2.lineHeight,
          fontWeight: typography.h2.fontWeight,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          marginTop: spacing.sm,
          color: colors.text.secondary,
          fontSize: typography.body.fontSize,
          lineHeight: typography.body.lineHeight,
          textAlign: "center",
        }}
      >
        {t("nav.wipBody")}
      </Text>
    </View>
  );
}
