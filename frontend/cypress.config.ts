import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'bhtc6p',
  e2e: {
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
