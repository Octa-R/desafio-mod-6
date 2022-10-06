import "./components/btn-component";
import "./components/counter-component";
import "./components/hand-component";
import "./components/score-component";
import "./components/text-component";
import "./components/score-component";
import "./components/star-component";
import "./pages/welcome";
import "./pages/game";
import "./pages/game-over";
import "./pages/instructions";
import "./router";
import { state } from "./state";

(() => {
  state.init();
})();
