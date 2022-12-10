class ScoreComponent extends HTMLElement {
  shadow: ShadowRoot;
  type: string;
  playerScore: number;
  opponentScore: number;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.opponentScore = Number(this.getAttribute("opponent"));
    this.playerScore = Number(this.getAttribute("player"));
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const style = document.createElement("style");
    style.innerHTML = `
      .score-board {
        border: 10px solid #000;
        border-radius:10px;
        width:250px;
        height:220px;
        background-color: #fff;
        padding:20px 30px;
        font-family: 'Odibee Sans';
      }

      .score {
        font-size: 55px;
        text-align:center;
        margin:10px 10px;
      }

      .score-text {
        font-size: 45px;
        text-align:right;
        margin: 15px 0;
      }

    `;
    this.shadow.innerHTML = `
    <div class="score-board">
      <h2 class="score">Score</h2>
      <div class="score-text">Vos: ${this.playerScore}</div>
      <div class="score-text" >Máquina ${this.opponentScore}</div>
    </div>`;
    this.shadow.appendChild(style);
  }
}

customElements.define("score-component", ScoreComponent);
