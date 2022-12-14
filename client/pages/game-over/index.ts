import { Router } from "@vaadin/router";
import { state } from "../../state";
const imageURL = require("url:../../img/fondo.png");

class ResultsPage extends HTMLElement {
  shadow: ShadowRoot;

  starType: string;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    state.subscribe(() => {
      this.render();
    });
  }

  connectedCallback() {
    //funcion para limpiar mientras tanto el timeOut generado
    const highestId = window.setTimeout(() => {
      for (let i = highestId; i >= 0; i--) {
        window.clearInterval(i);
      }
    }, 0);
    this.render();
  }

  addListeners() {
    const btn = this.shadow.querySelector(".jugar");
    btn?.addEventListener("click", () => {
      Router.go("/instructions");
    });

    const resetBtn = <HTMLElement>this.shadow.querySelector(".reset-btn");
    resetBtn?.addEventListener("click", () => {
      // state.resetResults();
    });
  }

  render() {
    const style = document.createElement("style");
    style.innerHTML = `
        .main {
          box-sizing:border-box;
          height:100vh;
          background-color: #eee;
          background-image: url("${imageURL}");
          padding:50px 25px;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content: space-between;
        }
      `;

    const cs = state.getState();
    console.log("cs en game-over", cs)

    this.shadow.innerHTML = `
        <main class="main">
          <star-component type="${cs.result}">
          </star-component>
          <score-component 
            playerScore="${cs.playerScore}"
            playerName="${cs.userName}"
            opponentScore="${cs.opponentScore}"
            opponentName="${cs.opponentName}"
          >
          </score-component>
          <btn-component class="jugar" text="Volver a Jugar">
          </btn-component>
          <btn-component class="reset-btn" text="Reset">
          </btn-component>

        </main>
      `;

    this.addListeners();
    this.shadow.appendChild(style);
  }
}

customElements.define("game-over", ResultsPage);
