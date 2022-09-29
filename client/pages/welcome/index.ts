const imageURL = require("url:../../img/fondo.png");
export function initWelcomePage({ goTo }) {
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
      const btn = this.shadow.querySelector("btn-component");
      btn?.addEventListener("click", (evt) => {
        goTo("/instructions");
      });
    }

    render() {
      this.shadow.innerHTML = `
        <main class="main">
          <text-component type="title" text="Piedra Papel o Tijera"></text-component>
          <btn-component text="Empezar"></btn-component>
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
          justify-content: space-between;
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
}
