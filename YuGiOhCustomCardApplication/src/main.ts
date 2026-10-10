import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.ts";
import "./styles/global styles/global.css";
import "./styles/global styles/layout.css";
import "./styles/global styles/components.css";

createApp(App)
  .use(router)
  .mount("#app");