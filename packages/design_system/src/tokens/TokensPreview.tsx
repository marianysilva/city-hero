import React from "react";
import { Text, View } from "react-native";

import { brand, civic, semantic } from "./colors";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { typography } from "./typography";

/**
 * Renders every token visually — the Storybook "Tokens" story below is the
 * live preview page referenced by the design-tokens task's Definition of
 * Done. Not a reusable UI component; lives in tokens/, not atoms/.
 */
export function TokensPreview() {
  return (
    <View className="gap-8 p-6">
      <View>
        <Text className="mb-2 text-lg font-bold">Brand</Text>
        <View className="flex-row flex-wrap gap-2">
          {Object.entries(brand).map(([step, hex]) => (
            <Swatch key={step} label={step} hex={hex} />
          ))}
        </View>
      </View>

      <View>
        <Text className="mb-2 text-lg font-bold">Civic</Text>
        <View className="flex-row flex-wrap gap-2">
          {Object.entries(civic).map(([name, hex]) => (
            <Swatch key={name} label={name} hex={hex} />
          ))}
        </View>
      </View>

      <View>
        <Text className="mb-2 text-lg font-bold">Semantic</Text>
        <View className="flex-row flex-wrap gap-2">
          {Object.entries(semantic).map(([name, hex]) => (
            <Swatch key={name} label={name} hex={hex} />
          ))}
        </View>
      </View>

      <View>
        <Text className="mb-2 text-lg font-bold">Typography</Text>
        {Object.entries(typography).map(([name, variant]) => (
          <Text
            key={name}
            style={{ fontSize: variant.fontSize, lineHeight: variant.lineHeight }}
            className="font-sans"
          >
            {name} — {variant.fontSize}/{variant.lineHeight}
          </Text>
        ))}
      </View>

      <View>
        <Text className="mb-2 text-lg font-bold">Spacing</Text>
        <View className="gap-1">
          {Object.entries(spacing).map(([name, value]) => (
            <View key={name} className="flex-row items-center gap-2">
              <View style={{ width: value, height: 12 }} className="bg-brand-500" />
              <Text>
                {name} = {value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View>
        <Text className="mb-2 text-lg font-bold">Radius</Text>
        <View className="flex-row flex-wrap gap-3">
          {Object.entries(radius).map(([name, value]) => (
            <View key={name} className="items-center gap-1">
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: Math.min(value, 24),
                }}
                className="bg-civic-purple"
              />
              <Text>{name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function Swatch({ label, hex }: { label: string; hex: string }) {
  return (
    <View className="items-center gap-1">
      <View style={{ width: 48, height: 48, backgroundColor: hex }} className="rounded-md" />
      <Text className="text-xs">{label}</Text>
    </View>
  );
}
