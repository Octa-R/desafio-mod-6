const imageURL = require("url:../../img/fondo.png");
import { Router } from "@vaadin/router";
import { state } from "../../state";
class JoinGamePage extends HTMLElement {
  shadow: ShadowRoot;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  addListeners() {
    const joinGame = async () => {
      const nameInput = this.shadow.querySelector(".name-input") as any
      const codeInput = this.shadow.querySelector(".code-input") as any

      const data = {
        name: nameInput.getValue(),
        code: codeInput.getValue()
      }
      try {
        await state.joinGame(data)
        Router.go("/instructions")
      } catch (error) {
        state.errorMessage = error
        Router.go("/join-error")
      }
    }
    const joinBtn = this.shadow.querySelector(".join");
    joinBtn?.addEventListener("click", (evt) => {
      joinGame();
    });
  }

  render() {
    this.shadow.innerHTML = `
        <main class="main">
          <text-component type="title" text="Piedra Papel o Tijera"></text-component>
            <input-component class="name-input" placeholder="nombre"></input-component>
            <input-component class="code-input" placeholder="código"></input-component>
            <btn-component class="join" text="comenzar"></btn-component>
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
          gap:20px;
        }
        .hands-container {
          height:50px;
          width:100%;
        }
      `;
    this.addListeners()
    this.shadow.appendChild(style);
  }
}

customElements.define("join-game", JoinGamePage);
