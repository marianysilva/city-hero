import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { useState } from "react";
import { Text, View } from "react-native";

import { BottomNav } from "./BottomNav";
import type { BottomNavItem, BottomNavMoreItem } from "./BottomNav.types";
import { BottomNavMoreSheet } from "./BottomNavMoreSheet";

// Emoji stand in for the real icon set (the design system ships no icon
// library yet — see LogoMark, which uses an emoji glyph the same way).
const TABS: BottomNavItem[] = [
  { key: "home", label: "Mapa", icon: "🗺️" },
  { key: "feed", label: "Feed", icon: "📰" },
  { key: "profile", label: "Perfil", icon: "🙂" },
  { key: "more", label: "Mais", icon: "☰" },
];

const MORE_ITEMS: BottomNavMoreItem[] = [
  { key: "notifications", label: "Notificações", icon: "🔔", badgeCount: 3, onPress: () => {} },
  { key: "news", label: "Notícias da Prefeitura", icon: "📣", onPress: () => {} },
  { key: "city-profile", label: "Perfil da Cidade", icon: "🏙️", onPress: () => {} },
  { key: "programs", label: "Programas & Transparência", icon: "📊", onPress: () => {} },
  { key: "services", label: "Serviços & Obras", icon: "🛠️", onPress: () => {} },
  {
    key: "sync-queue",
    label: "Fila de sincronização",
    icon: "🔄",
    badgeCount: 2,
    onPress: () => {},
  },
  { key: "settings", label: "Configurações", icon: "⚙️", onPress: () => {} },
  { key: "logout", label: "Sair", icon: "🚪", onPress: () => {} },
];

/** Phone-footer frame so the bar sits where it would on a real screen. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ width: 390, height: 240, justifyContent: "flex-end" }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ opacity: 0.4 }}>· screen content ·</Text>
      </View>
      {children}
    </View>
  );
}

const meta: Meta<typeof BottomNav> = {
  title: "Organisms/BottomNav",
  component: BottomNav,
  parameters: {
    docs: {
      description: {
        component:
          "The app's primary bottom navigation: four routable tabs (Map, Feed, Profile, More) " +
          "plus an elevated center Camera FAB. Presentational and route-driven — pass `activeTab` " +
          "(derived from the route) and callbacks; haptics/analytics/navigation live in the caller. " +
          "See docs/tasks/00-foundation/03-bottom-nav-component.md.",
      },
    },
  },
  argTypes: {
    activeTab: { control: "select", options: ["home", "feed", "profile", "more", null] },
  },
  args: {
    activeTab: "home",
    items: TABS,
    moreItems: MORE_ITEMS,
    fab: { accessibilityLabel: "Tirar foto do problema", onPress: () => {} },
    onTabPress: () => {},
    moreCloseAccessibilityLabel: "Fechar",
  },
  render: (args) => (
    <Frame>
      <BottomNav {...args} />
    </Frame>
  ),
};

export default meta;
type Story = StoryObj<typeof BottomNav>;

export const Default: Story = {};

export const FeedActive: Story = { args: { activeTab: "feed" } };

export const MoreActive: Story = {
  args: { activeTab: "more" },
  parameters: {
    docs: {
      description: {
        story:
          "The More tab stays highlighted while the user is on one of its sub-screens " +
          "(My Reports, Notifications, News, …), even though tapping it opens a sheet.",
      },
    },
  },
};

export const UnknownRoute: Story = {
  args: { activeTab: null },
  parameters: {
    docs: {
      description: { story: "No tab is highlighted when the route maps to none." },
    },
  },
};

export const WithTabBadge: Story = {
  args: {
    activeTab: "home",
    items: [TABS[0], { ...TABS[1], badgeCount: 5 }, TABS[2], { ...TABS[3], badgeCount: 12 }],
  },
  parameters: {
    docs: {
      description: {
        story: "Count badges on tabs (Feed = 5, More = 12 → capped to “9+”).",
      },
    },
  },
};

/**
 * The "More" sheet, shown open. Rendered via the standalone
 * `BottomNavMoreSheet` (visibility is normally owned by `BottomNav`'s internal
 * state) so the open state is capturable as a static story.
 */
export const MoreSheetOpen: StoryObj = {
  render: () => {
    return (
      <Frame>
        <BottomNav
          activeTab="more"
          items={TABS}
          moreItems={MORE_ITEMS}
          fab={{ accessibilityLabel: "Tirar foto", onPress: () => {} }}
          onTabPress={() => {}}
          moreCloseAccessibilityLabel="Fechar"
        />
        <BottomNavMoreSheet
          visible
          items={MORE_ITEMS}
          onClose={() => {}}
          closeAccessibilityLabel="Fechar"
        />
      </Frame>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "The secondary-destinations sheet, with count badges on Notifications and Sync Queue.",
      },
    },
  },
};

/** Interactive: tap More to open the real sheet, tap a tab to move the highlight. */
export const Interactive: StoryObj = {
  render: () => {
    const InteractiveNav = () => {
      const [active, setActive] = useState<"home" | "feed" | "profile" | "more">("home");
      return (
        <Frame>
          <BottomNav
            activeTab={active}
            items={TABS}
            moreItems={MORE_ITEMS}
            fab={{ accessibilityLabel: "Tirar foto", onPress: () => {} }}
            onTabPress={(key) => setActive(key)}
            moreCloseAccessibilityLabel="Fechar"
          />
        </Frame>
      );
    };
    return <InteractiveNav />;
  },
};
