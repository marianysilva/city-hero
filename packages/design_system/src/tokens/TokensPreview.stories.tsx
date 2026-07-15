import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

import { TokensPreview } from "./TokensPreview";

const meta: Meta<typeof TokensPreview> = {
  title: "Tokens/Overview",
  component: TokensPreview,
  parameters: {
    docs: {
      description: {
        component:
          "Live preview of every design token (colors, typography, spacing, radius). " +
          "To add a new component: create `src/<tier>/<Name>/<Name>.tsx` per the tier " +
          "rules in `docs/engineering/design-system.md`, add a sibling `<Name>.stories.tsx` " +
          "covering its variants/states, then re-export it from `src/index.ts`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TokensPreview>;

export const Overview: Story = {};
