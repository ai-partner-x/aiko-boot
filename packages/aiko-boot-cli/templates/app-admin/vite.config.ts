import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig, loadEnv } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const proxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:3001"

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@scaffold/system/client": path.resolve(__dirname, "../system/dist/client/index.ts"),
        "@scaffold/core": path.resolve(__dirname, "../core/src/index.ts"),
      },
    },
    server: {
      port: 4200,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
