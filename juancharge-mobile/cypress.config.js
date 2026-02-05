import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:3000",
        viewportWidth: 375,
        viewportHeight: 667,
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        supportFile: "cypress/support/e2e.js",
    },
});
