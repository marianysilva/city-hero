import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { TextInput } from "./TextInput";

const meta: Meta<typeof TextInput> = {
  title: "Atoms/TextInput",
  component: TextInput,
  parameters: {
    docs: {
      description: {
        component:
          "Labeled text field with a focus ring. Composition over configuration — password " +
          "visibility, search, and validation are composed by the caller via `rightElement` / " +
          "`secureTextEntry`, not built into this atom. See `docs/engineering/design-system.md`.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    secureTextEntry: { control: "boolean" },
  },
  args: {
    label: "E-mail",
    placeholder: "seu@email.com",
  },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

/** Most common usage — controls in the panel below let you try every prop. */
export const Default: Story = {};

export const WithIcon: Story = {
  args: { label: "E-mail", placeholder: "seu@email.com" },
  render: (args) => (
    <TextInput {...args} icon={<Text style={{ color: "#94A3B8", fontSize: 15 }}>✉</Text>} />
  ),
};

/** Password field composed with a reveal/hide toggle in `rightElement`. */
export const PasswordWithToggle: Story = {
  args: { label: "Senha", placeholder: "••••••••" },
  render: (args) => {
    function PasswordField() {
      const [visible, setVisible] = useState(false);
      return (
        <TextInput
          {...args}
          secureTextEntry={!visible}
          icon={<Text style={{ color: "#94A3B8", fontSize: 15 }}>🔒</Text>}
          rightElement={
            <Pressable onPress={() => setVisible((v) => !v)}>
              <Text style={{ color: "#F97316", fontSize: 11, fontWeight: "700" }}>
                {visible ? "OCULTAR" : "VER"}
              </Text>
            </Pressable>
          }
        />
      );
    }
    return <PasswordField />;
  },
};

export const Focused: Story = {
  parameters: {
    docs: { description: { story: "Simulated focus state — border + ring on `brand-400`." } },
  },
  render: () => (
    <View>
      <TextInput label="E-mail" placeholder="seu@email.com" autoFocus />
    </View>
  ),
};
