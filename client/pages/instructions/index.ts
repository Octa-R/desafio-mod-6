import { Router } from "@vaadin/router";
const imageURL = require("url:../../img/fondo.png");
class InstructionsPage extends HTMLElement {
  shadow: ShadowRoot;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render();
  }

  addListeners() {
    const btn = this.shadow.querySelector("btn-component");
    btn?.addEventListener("click", (evt) => {
      Router.go("/game");
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
