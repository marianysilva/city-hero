// `react-native-css/types` (NativeWind v5's className/JSX augmentation
// provider, referenced by nativewind-env.d.ts) augments ViewProps, TextProps,
// ScrollViewProps, etc. with `className` — but not PressableProps, verified
// by reading node_modules/react-native-css/types.d.ts directly. `Button.tsx`
// uses `<Pressable className="...">` directly, so it needs this gap patched.
//
// This lives in a plain .ts module (not an ambient .d.ts) and is imported
// for its side effect from `index.ts`, the one file every consumer of this
// package is guaranteed to reach — an ambient .d.ts here would only apply
// within this package's own "include" list (e.g. its own `npm run typecheck`),
// not in a consuming app's separate tsconfig/program (e.g. apps/city-hero's),
// which doesn't reference this package's files directly.
declare module "react-native" {
  interface PressableProps {
    className?: string;
  }
}

// A file with no top-level import/export is a "global script" to TypeScript,
// and `declare module "x"` inside a global script *replaces* module `x`
// instead of augmenting it — which just broke every `react-native` import in
// the package (`Module '"react-native"' has no exported member 'View'`, etc.).
// This empty export makes the file a real ES module, so the block above is
// correctly treated as an augmentation of the existing "react-native" module.
export {};
