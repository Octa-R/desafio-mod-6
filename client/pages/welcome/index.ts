const imageURL = require("url:../../img/fondo.png");
import { Router } from "@vaadin/router";
class WelcomePage extends HTMLElement {
  shadow: ShadowRoot;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  addListeners() {
    const newGameBtn = this.shadow.querySelector(".new-game-btn");
    newGameBtn?.addEventListener("click", (evt) => {
      Router.go("/new-game");
    });
    const joinGameBtn = this.shadow.querySelector(".join-game-btn");
    joinGameBtn?.addEventListener("click", (evt) => {
      Router.go("/join-game");
    });
  }

  render() {
    this.shadow.innerHTML = `
        <main class="main">
          <text-component type="title" text="Piedra Papel o Tijera"></text-component>
          <btn-component class="new-game-btn" text="Nuevo Juego"></btn-component>
          <btn-component class="join-game-btn" text="Ingresar a una sala"></btn-component>
          <div class="hands-container">
            <hand-component type="tijeras" ></hand-component>
            <hand-component type="piedra" ></hand-component>
            <hand-component type="papel" ></hand-component>
          </div>
        </main>
      `;
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
          align-items:stretch;
          justify-content: center;
          gap:30px;
        }
        .hands-container {
          height:50px;
          width:100%;
        }
      `;

    this.addListeners();
    this.shadow.appendChild(style);
  }
}

customElements.define("welcome-page", WelcomePage);
