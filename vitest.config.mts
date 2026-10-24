import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.tsx"],
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
})