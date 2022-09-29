class CounterComponent extends HTMLElement {
  shadow: ShadowRoot;
  count: number;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.count = Number(this.getAttribute("count") || 3);
  }

  setAnimationCounter() {
    const timeOut = setTimeout(() => {
      this.finishevent(timeOut);
    }, this.count * 1000);

    for (let i = 0; i < this.count; i++) {
      setTimeout(() => {
        const numberToShow = this.count - i;
        const numberContainer = <HTMLElement>(
          this.shadow.querySelector(".number")
        );
        numberContainer.innerText = numberToShow.toString();
      }, i * 1000);
    }
  }

  finishevent(timeOut) {
    window.clearTimeout(timeOut);
    const loading = this.shadow.querySelector(".loading");
    loading?.classList.add("hide");
    const event = new CustomEvent("finished", {
      detail: {
        description: "finished counting",
      },
    });
    this.dispatchEvent(event);
  }

  connectedCallback() {
    this.setAnimationCounter();
    this.render();
  }

  render() {
    const style = document.createElement("style");

    style.innerHTML = `
      .loading {
        display:flex;
        justify-content: center;
        align-items:center;
      }
      .hide {
        display:none;
      }
      .loading::after {
        content: "";
        width: 240px;
        height: 240px;
        border: 20px solid #ddd;
        border-top-color: #000;
        border-radius: 50%;
        animation: loading 1s linear ;
        animation-iteration-count: ${this.count};
      }
      .number {
        position: absolute;
        font-size:100px;
        font-family: 'Odibee Sans', cursive;
        font-weight:700;
      }
      @keyframes loading {
        to {
          transform:rotate(1turn);
        }
      }
    `;

    this.shadow.innerHTML = `
      <div class="loading">
        <div class="number">
        </div>
      </div>
    `;

    this.shadow.appendChild(style);
  }
}
customElements.define("counter-component", CounterComponent);
