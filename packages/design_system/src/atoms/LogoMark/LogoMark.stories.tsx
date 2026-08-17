import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { View } from "react-native";

import { LogoMark } from "./LogoMark";

const meta: Meta<typeof LogoMark> = {
  title: "Atoms/LogoMark",
  component: LogoMark,
  parameters: {
    docs: {
      description: {
        component:
          "The CityHero brand mark, shared between Splash (animated, `on-color`) and Login " +
          "(static, `on-light`) — see `docs/engineering/design-system.md`.",
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["on-color", "on-light"] },
    size: { control: "select", options: ["md", "lg"] },
  },
  args: { variant: "on-color", size: "lg" },
};

export default meta;
type Story = StoryObj<typeof LogoMark>;

export const OnColor: Story = {
  args: { variant: "on-color", size: "lg" },
  parameters: {
    docs: { description: { story: "Sits on the brand gradient background — see Splash." } },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 24, backgroundColor: "#7C3AED" }}>
        <Story />
      </View>
    ),
  ],
};

export const OnLight: Story = {
  args: { variant: "on-light", size: "md" },
  parameters: {
    docs: { description: { story: "Sits on a white/light surface — see Login's header." } },
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
      <View style={{ padding: 24, backgroundColor: "#7C3AED" }}>
        <LogoMark variant="on-color" size="lg" />
      </View>
      <LogoMark variant="on-light" size="md" />
    </View>
  ),
};
