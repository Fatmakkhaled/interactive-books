import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import studyHandler from "./api/study.ts";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), ["GEMINI_", "STUDY_AI_"]);
  // These values belong to the development server; never expose them via define or VITE_*.
  for (const [name, value] of Object.entries(environment))
    if (!process.env[name]) process.env[name] = value;
  return {
    optimizeDeps: { include: ["pdfjs-dist"] },
    plugins: [
      react(),
      {
        name: "study-assistant-api",
        configureServer(server) {
          server.middlewares.use("/api/study", (request, response) => {
            void studyHandler(request, response);
          });
        },
      },
    ],
  };
});
