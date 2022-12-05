import { Router } from "@vaadin/router";
import { state } from "../../state";
const imageURL = require("url:../../img/fondo.png");
class InstructionsPage extends HTMLElement {
  shadow: ShadowRoot;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const unsubscribeWaitingForStart = state.subscribe(() => {
      const cs = state.getState()
      if (cs.opponentPressedStart && cs.playerPressedStart) {
        unsubscribeWaitingForStart()
        console.log("ambos presionaron start redirigiendo a /game")
        // Router.go("/game")
      }
    })
  }
  connectedCallback() {
    this.render();
  }

  addListeners() {
    const btn = this.shadow.querySelector("btn-component");
    btn?.addEventListener("click", (evt) => {
      state.startGame()
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
          padding:100px 25px;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content: space-between;
        }
      `;
    const text = `Presioná jugar y elegí: piedra, papel o tijera antes de que pasen los 3 segundos.`;
    this.shadow.innerHTML = `
      <main class="main">
        <text-component 
          type="p" 
          text="${text}">
        </text-component>
        <btn-component text="¡Jugar!">
        </btn-component>

        <hand-component type="tijeras" >
        </hand-component>

        <hand-component type="piedra" >
        </hand-component>
        
        <hand-component type="papel" >
        </hand-component>
      </main>
    `;
    this.addListeners();
    this.shadow.appendChild(style);
  }
}

customElements.define("instructions-page", InstructionsPage);
