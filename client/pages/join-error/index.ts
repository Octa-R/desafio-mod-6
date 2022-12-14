const imageURL = require("url:../../img/fondo.png");
import { Router } from "@vaadin/router";
import { state } from "../../state";
class JoinGameErrorPage extends HTMLElement {
  shadow: ShadowRoot;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  addListeners() {
    const backBtn = this.shadow.querySelector(".volver");
    backBtn?.addEventListener("click", (evt) => {
      Router.go("/")
    });
  }

  render() {
    this.shadow.innerHTML = `
        <main class="main">
          <text-component type="title" text="Piedra Papel o Tijera"></text-component>
          <text-component text="${state.errorMessage}"></text-component>
          <btn-component class="volver" text="volver"></btn-component>
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
      `;
    this.addListeners()
    this.shadow.appendChild(style);
  }
}

customElements.define("join-error", JoinGameErrorPage);
