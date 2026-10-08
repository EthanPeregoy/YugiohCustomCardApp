import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.ts";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/card-search.css";

createApp(App)
  .use(router)
  .mount("#app");