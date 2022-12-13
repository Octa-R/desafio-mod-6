import { state } from "../../state";
import { Router } from "@vaadin/router";
const imageURL = require("url:../../img/fondo.png");
class NewGamePage extends HTMLElement {
  shadow: ShadowRoot;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  addListeners() {
    const startBtn = this.shadow.querySelector(".start-btn")
    startBtn?.addEventListener("click", () => {
      const nameInput = this.shadow.querySelector(".name-input") as any
      const cs = state.getState()
      cs.userName = nameInput.getValue();
      state.setState(cs);

      state.createNewGame()
        .then(() => {
          Router.go("/game-code");
        })
    })
  }

  render() {
    const style = document.createElement("style");
    style.innerHTML = `
        .container {
          display:grid;
          grid-template-rows:50px auto;
          grid-template-columns:auto;
          grid-template-areas:
            "header"
            "main";
            box-sizing:border-box;
            height:100vh;
            background-color: #eee;
            background-image: url("${imageURL}");
            padding:100px 25px;
        }

        .header{
          grid-area:header;
        }

        .main {
          grid-area:main;

          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content: center;
          gap:10px;
        }
      `;
    this.shadow.innerHTML = `
      <div class="container">
        <header class="header">
        </header>
        <main class="main">
          <input-component class="name-input" placeholder="nombre"></input-component>
          <btn-component class="start-btn" text="Empezar juego!"></btn-component>
        </main>
      </div>
    `;
    this.addListeners();
    this.shadow.appendChild(style);
  }
}

customElements.define("new-game", NewGamePage);
