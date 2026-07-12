import sharedValues from "./shared-values.js";

// sm/md/lg/xl live in ./shared-values.js, shared with tailwind.preset.js.
// `full` is RN-only (Tailwind already ships a `rounded-full` utility).
export const radius = { ...sharedValues.radius, full: 9999 };
