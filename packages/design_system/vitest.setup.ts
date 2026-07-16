import "@testing-library/jest-dom/vitest";

// react-native-web's useColorScheme reads `window.matchMedia`, which jsdom
// doesn't implement. Tests that need a specific scheme pass an explicit
// `initialPreference` to <ThemeProvider> instead of relying on system
// detection, but this stub keeps any incidental call from throwing.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
