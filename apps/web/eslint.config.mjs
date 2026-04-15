// eslint-config-next >= 15 exports a flat-config array directly, so we
// spread it without going through FlatCompat. FlatCompat triggers the
// legacy @eslint/eslintrc validator, which chokes on circular structures
// in eslint-plugin-react's shared config.
import nextConfig from "eslint-config-next";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  ...nextConfig,
];

export default config;
