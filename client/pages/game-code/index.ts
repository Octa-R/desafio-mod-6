import { Router } from "@vaadin/router";
import { state } from "../../state";
const imageURL = require("url:../../img/fondo.png");
class GameCodePage extends HTMLElement {
  shadow: ShadowRoot;
  roomId: string;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.roomId = state.getRoomId()
    const unsubscribeWaitingForOpponent = state.subscribe(() => {
      if (state.isOpponentOnline()) {
        unsubscribeWaitingForOpponent()
        Router.go("/instructions")
      }
    })
  }
  connectedCallback() {
    this.render();
  }

  addListeners() {
    const btn = this.shadow.querySelector(".copy-btn");
    const copyContent = async () => {
      try {
        await navigator.clipboard.writeText(this.roomId);
        console.log('Content copied to clipboard');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
    btn?.addEventListener("click", (evt) => {
      copyContent()
    });
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
    const text = `Compartí el código con tu contrincante: ${this.roomId}`;

    this.shadow.innerHTML = `
      <div class="container">
        <header class="header">
        </header>
        <main class="main">
          <text-component 
            type="p" 
            text="${text}">
          </text-component>
          <btn-component class="copy-btn" text="Copiar código!"></btn-component>
        </main>
      </div>
    `;
    this.addListeners();
    this.shadow.appendChild(style);
  }
}

customElements.define("game-code", GameCodePage);
