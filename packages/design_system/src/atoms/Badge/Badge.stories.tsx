import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { View } from "react-native";

import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  // Badge relies on `alignSelf: "flex-start"` to hug its content instead of
  // stretching — that only takes effect when the immediate parent is a flex
  // container. Every real RN View is one automatically, but Storybook's raw
  // canvas root (for simple args-only stories, with no custom `render`) is
  // a plain, non-flex div, so without this wrapper the badge would stretch
  // to the full canvas width here (Storybook-only artifact, not a bug in
  // Badge itself — confirmed by testing against the real app tree).
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The single atom every label-shaped surface reuses (status pills, category chips, " +
          "confidence scores, filter chips, kickers...) — children-first composition, no `kind` " +
          "prop. See the Badge section in docs/engineering/component-inventory.md.",
      },
    },
  },
  argTypes: {
    color: {
      control: "select",
      options: ["brand", "success", "warning", "danger", "info", "neutral"],
    },
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    variant: { control: "select", options: ["filled", "outline", "ghost"] },
    radius: { control: "select", options: ["sm", "md", "full"] },
    selected: { control: "boolean" },
  },
  args: {
    children: "EM ANDAMENTO",
    color: "warning",
    size: "md",
    variant: "filled",
    radius: "full",
    selected: false,
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const AllColors: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      <Badge color="brand">Brand</Badge>
      <Badge color="success">Success</Badge>
      <Badge color="warning">Warning</Badge>
      <Badge color="danger">Danger</Badge>
      <Badge color="info">Info</Badge>
      <Badge color="neutral">Neutral</Badge>
    </View>
  ),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Badge variant="filled">Filled</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
    </View>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
      <Badge size="xs">XS</Badge>
      <Badge size="sm">SM</Badge>
      <Badge size="md">MD</Badge>
      <Badge size="lg">LG</Badge>
    </View>
  ),
};

/** Real composition: status pill, per the pattern in component-inventory.md. */
export const StatusPillComposition: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Badge color="warning">EM ANDAMENTO</Badge>,
};

export const Selected: Story = {
  args: { selected: true, children: "Buracos" },
};

export const Pressable: Story = {
  args: { children: "Buracos", onPress: () => {} },
};
