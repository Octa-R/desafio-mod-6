import { Router } from "@vaadin/router";
import { state } from "../../state";
import { Play } from "../../types/play";

const imageURL = require("url:../../img/fondo.png");
class GamePage extends HTMLElement {
  shadow: ShadowRoot;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  addListeners() {
    const handList = this.shadow.querySelectorAll("hand-component");
    handList.forEach((item) => {
      item.addEventListener("player-move", (e) => {
        const { detail } = e as any;
        const playerMove: Play = detail.move;
        state.move(playerMove);
      });
    });
    const counter = <HTMLElement>this.shadow.querySelector("counter-component");
    counter.addEventListener("finished", async () => {
      await state.getGameResults();
      this.endGame();
    });
  }
  endGame() {
    const cs = state.getState();
    console.log(`termino el juego, el oponente jugo ${cs.opponentChoice} y yo jugue ${cs.playerChoice}`)
    if (cs.playerChoice && cs.opponentChoice) {
      console.log("ambos jugamos, redirigiendo a /game-over");
      Router.go("/game-over");
      this.showHandsAnimation();
    } else {
      Router.go("/instructions");
    }
  }

  showHandsAnimation() {
    const main = <HTMLElement>this.shadow.querySelector(".main");
    main.innerHTML = "";
    const cs = state.getState();
    main.innerHTML = `
      <hand-component 
        size="lg"
        position="up" 
        type="${cs.opponentChoice}">
      </hand-component>
      <hand-component 
        size="lg"
        showing="true"
        position="bottom"
        type="${cs.playerChoice}">
      </hand-component>
      `;

    // setTimeout(() => {
    //   Router.go("/game-over");
    // }, 2000);
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

        .hands-container {
          height:50px;
          width:50px;
        }
      `;

    this.shadow.innerHTML = `
        <main class="main">
          <counter-component count="3"></counter-component>
          <div class="hands-container">
            <hand-component size="md" type="tijeras" ></hand-component>
            <hand-component size="md" type="piedra" ></hand-component>
            <hand-component size="md" type="papel" ></hand-component>
          </div>
        </main>
      `;
    this.addListeners();
    this.shadow.appendChild(style);
  }
}

customElements.define("game-page", GamePage);
