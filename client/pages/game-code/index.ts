import { Router } from "@vaadin/router";
const imageURL = require("url:../../img/fondo.png");
class GameCodePage extends HTMLElement {
  shadow: ShadowRoot;
  gameCode: string;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render();
  }

  addListeners() {
    const btn = this.shadow.querySelector("copy-btn");
    const copyContent = async () => {
      try {
        await navigator.clipboard.writeText(this.gameCode);
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
    const text = `Compartí el código con tu contrincante:`;
    this.shadow.innerHTML = `
      <main class="main">
        <text-component 
          type="p" 
          text="${text}">
        </text-component>
        <span class="code"></span>
        <button class="copy-btn">Copy!</button>
      </main>
    `;
    this.addListeners();
    this.shadow.appendChild(style);
  }
}

customElements.define("game-code", GameCodePage);
