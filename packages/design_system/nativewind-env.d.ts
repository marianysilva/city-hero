/// <reference types="react-native-css/types" />

// This package uses `className` directly in its own source (not just via a
// consuming app's Metro-generated env file), so it needs this reference too.
// Points at `react-native-css/types` (NativeWind v5's actual className/JSX
// augmentation provider — see its own re-export at `nativewind/types.d.ts`)
// rather than `nativewind/types` directly: `nativewind` itself is only
// installed inside apps/city-hero/node_modules (design_system never runs
// through Metro, so it isn't a dependency here), while `react-native-css`
// is hoisted to the workspace root and reachable from this package.
