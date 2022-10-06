import { Router } from "@vaadin/router";

const router = new Router(document.getElementById("root"));
router.setRoutes([
  { path: "/", component: "welcome-page" },
  { path: "/welcome", component: "welcome-page" },
  { path: "/instructions", component: "instructions-page" },
  { path: "/game", component: "game-page" },
  { path: "/game-over", component: "game-over" },
]);
