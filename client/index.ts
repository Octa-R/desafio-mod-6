import "./components/btn-component";
import "./components/counter-component";
import "./components/hand-component";
import "./components/score-component";
import "./components/text-component";
import "./components/score-component";
import "./components/star-component";
import "./components/input-component"
import "./pages/welcome";
import "./pages/game";
import "./pages/game-over";
import "./pages/instructions";
import "./pages/join-game"
import "./pages/waiting-for-opponent"
import "./pages/waiting-for-play"
import "./pages/game-code"
import "./router";
import { state } from "./state";

(() => {
  state.init();
})();
