import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

import { About } from "./About";

const meta: Meta<typeof About> = {
  title: "Getting Started/About",
  component: About,
  parameters: {
    docs: {
      description: {
        component: "Landing page for the CityHero Design System's Storybook.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof About>;

export const Overview: Story = {};
