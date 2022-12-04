import { Router } from "@vaadin/router";

const router = new Router(document.getElementById("root"));
router.setRoutes([
  { path: "/", component: "welcome-page" },
  { path: "/welcome", component: "welcome-page" },
  { path: "/new-game", component: "new-game" },
  { path: "/game-code", component: "game-code" },
  { path: "/instructions", component: "instructions-page" },
  { path: "/join-game", component: "join-game" },
  { path: "/waiting-for-play", component: "waiting-for-play" },
  { path: "/waiting-for-opponent", component: "waiting-for-oponent" },
  { path: "/game", component: "game-page" },
  { path: "/game-over", component: "game-over" },
]);
