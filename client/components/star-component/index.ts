const loseStarImg = require("url:./lose.svg");
const winStarImg = require("url:./win.svg");
const empateStarSVG = require("url:./empate.svg");

class StarComponent extends HTMLElement {
  shadow: ShadowRoot;
  type: string;
  text: string;
  imgUrl: string;
  types: string[] = ["win", "lose", "empate"];

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.type = this.getAttribute("type") || "lose";
    if (this.type === "win") {
      this.text = "Ganaste!";
      this.imgUrl = winStarImg;
    } else if (this.type === "lose") {
      this.text = "Perdiste!";
      this.imgUrl = loseStarImg;
    } else if (this.type === "empate") {
      this.text = "Empate!";
      this.imgUrl = empateStarSVG;
    }
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const style = document.createElement("style");
    style.innerHTML = `
      .star {
        margin:0 auto;
        text-align: center;
        font-family: 'Courier Prime', monospace;
        width:250px;
        max-width:250px;
        font-size:55px;
        width:100%;
      }
    `;
    this.shadow.innerHTML = `
      <img class="star" src="${this.imgUrl}">
    `;
    this.shadow.appendChild(style);
  }
}

customElements.define("star-component", StarComponent);
