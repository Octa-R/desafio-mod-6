import { Router } from "@vaadin/router";
import { state } from "../../state";
const imageURL = require("url:../../img/fondo.png");

class ResultsPage extends HTMLElement {
  shadow: ShadowRoot;
  playerScore: number;
  computerScore: number;
  starType: string;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    state.subscribe((data: any) => {
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
      state.resetResults();
    });
  }

  render() {
    const style = document.createElement("style");
    const cs = state.getState();
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

    this.shadow.innerHTML = `
        <main class="main">
          <star-component type="${this.starType}">
          </star-component>
          <score-component 
            player="${cs.playerScore}"
            opponent="${cs.opponentScore}"
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
