export default defineAppConfig({
  gameClient: {
    name: "Hello from Nuxt layer",
  },
});

declare module "@nuxt/schema" {
  interface AppConfigInput {
    gameclient?: {
      /** Project name */
      name?: string;
    };
  }
}
