import { initWelcomePage } from "./pages/welcome";
import { initInstructionsPage } from "./pages/instructions";
import { initGamePage } from "./pages/game";
import { initGameOverPage } from "./pages/game-over";
const routes = [
  {
    path: /\//,
    component: () => document.createElement("welcome-page"),
  },
  {
    path: /\/welcome/,
    component: () => document.createElement("welcome-page"),
  },
  {
    path: /\/instructions/,
    component: () => document.createElement("instructions-page"),
  },
  {
    path: /\/game/,
    component: () => document.createElement("game-page"),
  },
  {
    path: /\/game-over/,
    component: () => document.createElement("game-over"),
  },
];

export function initRouter(container: Element) {
  function goTo(path: string) {
    history.pushState({}, "", path);
    handleRoute(path);
  }

  initGameOverPage({ goTo });
  initInstructionsPage({ goTo });
  initWelcomePage({ goTo });
  initGamePage({ goTo });

  function handleRoute(route) {
    for (const r of routes) {
      if (r.path.test(route)) {
        const el = r.component();
        if (container.firstChild) {
          container.firstChild.remove();
        }
        container.appendChild(el);
      }
    }
  }
  handleRoute(location.pathname);
}
