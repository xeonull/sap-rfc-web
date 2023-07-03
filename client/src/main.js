import { createApp } from "vue";
import App from "./App.vue";

import router from "./router";
// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { corpDarkTheme, corpLightTheme } from "@/ui/themes.js";

import { store } from "@/store/store.js";

const vuetify = createVuetify({
  theme: {
    defaultTheme: store.isDarkTheme ? "corpDarkTheme" : "corpLightTheme",
    themes: { corpLightTheme, corpDarkTheme },
  },
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
});

createApp(App).use(router).use(vuetify).mount("#app");
