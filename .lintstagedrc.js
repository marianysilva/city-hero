const path = require("path");

// ESLint's flat config is resolved relative to the process cwd, not the
// linted file's directory — and Next.js's own rules (e.g. page detection)
// also read cwd directly. lint-staged runs from the repo root, so eslint
// must be invoked with the target app as its actual cwd (via `sh -c cd &&`)
// rather than with `--config <path>` from the root, which breaks both of
// those cwd-relative lookups.
function scopedEslint(appDir) {
  return (filenames) => {
    const files = filenames
      .map((file) => path.relative(path.resolve(appDir), file).split(path.sep).join("/"))
      .join(" ");
    return `sh -c "cd ${appDir} && npx eslint --fix ${files}"`;
  };
}

module.exports = {
  "apps/backend/**/*.py": ["ruff check --fix"],
  "apps/web/**/*.{ts,tsx,js,jsx}": [scopedEslint("apps/web"), "prettier --write"],
  "apps/city-hero/**/*.{ts,tsx,js,jsx}": [scopedEslint("apps/city-hero"), "prettier --write"],
  "packages/**/*.{ts,tsx}": ["prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
};
