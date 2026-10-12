import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.ts";
import "./global/styles/global.css";
import "./global/styles/layout.css";
import "./global/styles/components.css";

createApp(App)
  .use(router)
  .mount("#app");