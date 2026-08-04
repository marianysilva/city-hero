import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { View } from "react-native";

import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Primary action atom. Variant is a discriminated union (`primary` | " +
          "`secondary` | `ghost` | `destructive` | `inverse` | `glass`), not boolean flags — see " +
          "`docs/engineering/design-system.md`. `inverse`/`glass` are the on-color pair, for CTAs " +
          "sitting on a colorful/photo background instead of the default surface. Every visual " +
          "value comes from design tokens (colors, spacing, radius, typography), never a literal.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "destructive", "inverse", "glass"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Reportar problema",
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/** Most common usage — controls in the panel below let you try every prop. */
export const Default: Story = {};

export const Primary: Story = {
  args: { variant: "primary", children: "Reportar problema" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Cancelar" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ver detalhes" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Excluir relato" },
};

export const Inverse: Story = {
  args: { variant: "inverse", children: "Entrar com e-mail" },
  parameters: {
    docs: { description: { story: "White-on-color CTA — see Splash's primary welcome action." } },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 24, backgroundColor: "#7C3AED" }}>
        <Story />
      </View>
    ),
  ],
};

export const Glass: Story = {
  args: { variant: "glass", children: "Entrar com Gov.br" },
  parameters: {
    docs: {
      description: { story: "Translucent secondary CTA — see Splash's Gov.br welcome action." },
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 24, backgroundColor: "#7C3AED" }}>
        <Story />
      </View>
    ),
  ],
};

export const WithIcon: Story = {
  args: {
    variant: "glass",
    children: "Entrar com Gov.br",
    icon: <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#4ADE80" }} />,
  },
  parameters: {
    docs: { description: { story: "`icon` renders before the label — e.g. a provider mark." } },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 24, backgroundColor: "#7C3AED" }}>
        <Story />
      </View>
    ),
  ],
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <View style={{ gap: 12, alignItems: "flex-start" }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <View style={{ gap: 12, alignItems: "flex-start", padding: 12, backgroundColor: "#7C3AED" }}>
        <Button variant="inverse">Inverse</Button>
        <Button variant="glass">Glass</Button>
      </View>
    </View>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </View>
  ),
};

export const Loading: Story = {
  args: { loading: true, children: "Enviando..." },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Indisponível" },
};
