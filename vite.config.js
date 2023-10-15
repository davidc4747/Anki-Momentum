import { resolve } from "path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
    plugins: [
        viteSingleFile({
            useRecommendedBuildConfig: false,
            removeViteModuleLoader: true,
        }),
    ],
    build: {
        rollupOptions: {
            input: [
                resolve("./src/deck-browser/index.html"),
                resolve("./src/overview/index.html"),
            ],
        },
    },
});
