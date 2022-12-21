import { Router } from "@vaadin/router";
import { state } from "../../state";
import { Play } from "../../types/play";

const imageURL = require("url:../../img/fondo.png");
class GamePage extends HTMLElement {
  shadow: ShadowRoot;
  gameEnded = false;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const unsubscribe = state.subscribe(() => {
      const cs = state.getState();
      if (cs.opponentChoice && cs.playerChoice) {
        console.log("se disparo la callback, y ambos jugadores eligieron, se ejecutara endGame()")
        this.gameEnded = true;
        unsubscribe();
        this.endGame();
      }
    });
  }

  connectedCallback() {
    this.render();
  }

  addListeners() {
    const handList = this.shadow.querySelectorAll("hand-component");
    handList.forEach((item) => {
      item.addEventListener("player-move", (e) => {
        const playerMove: Play = (<CustomEvent>e).detail.move
        state.move(playerMove);
      });
    });
    const counter = <HTMLElement>this.shadow.querySelector("counter-component");
    counter.addEventListener("finished", () => {
      //"se disparo evento finished del counter se ejecutara endGame()")
      this.gameEnded = true;
      this.endGame();
    });
  }
  endGame() {
    const cs = state.getState();

    if (cs.opponentChoice && cs.playerChoice) {
      //"termino la cuenta regresiva y ambos eligieron redirigiendo a /game-over")
      this.showHandsAnimation();
    } else {
      if (this.gameEnded) {
        //"estamos en el else de endGame pero el juego ya termino")
        return
      }
      //"termino la cuenta regresiva y no eligieron redirigiendo a /instructions")
      Router.go("/instructions");
    }
  }

  showHandsAnimation() {
    const main = <HTMLElement>this.shadow.querySelector(".main")
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

    setTimeout(() => {
      Router.go("/game-over");
    }, 3000);
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
