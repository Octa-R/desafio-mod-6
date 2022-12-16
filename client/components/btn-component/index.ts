class ButtonComponent extends HTMLElement {
  shadow: ShadowRoot;
  text: string;

  type: string;
  listener: () => any;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.text = this.getAttribute("text") || "";
    this.type = this.getAttribute("type") || ""
  }
  connectedCallback() {
    this.render();
  }
  addListeners() {
    function createRipple(event) {
      const button = event.currentTarget;

      const circle = document.createElement("span");
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
      circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
      circle.classList.add("ripple");

      const ripple = button.getElementsByClassName("ripple")[0];

      if (ripple) {
        ripple.remove();
      }

      button.appendChild(circle);
    }

    const btn = this.shadow.querySelector(".button")
    btn?.addEventListener("click", createRipple);
  }
  addLoading() {
    const btn = this.shadow.querySelector(".button")
    btn?.addEventListener("click", evt => {
      btn.innerHTML = ""
      const loaderEl = document.createElement("div")
      loaderEl.classList.add("loader")
      btn.appendChild(loaderEl)
    });
  }

  render() {
    const style = document.createElement("style");
    style.innerHTML = `
      .container {
        width:100%;
        display:flex;
        align-items:center;
        justify-content:center;
      }
      
      .button {
        font-family:'Odibee Sans', cursive;
        height:84px;
        width:368px;
        background-color: var(--azul-claro);
        border: 10px solid var(--azul-oscuro);
        border-radius: 10px;
        color: #eee;
        font-size: 45px;
        margin:0 auto;
        cursor:pointer;

        position: relative;
        overflow: hidden;
        transition: background 400ms;
      }
      .button:hover {
        background-color: var(--azul-oscuro);
        color: var(--azul-claro);
      }


      span.ripple {
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 600ms linear;
        background-color: rgba(255, 255, 255, 0.7);
      }
      
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }

      .loader {
        margin: 0 auto;
        border: 10px solid #EAF0F6;
        border-radius: 50%;
        border-top: 10px solid var(--azul-oscuro);
        width: 25px;
        height: 25px;
        animation: spinner 0.5s linear infinite;
        z-index: 12;
      }

      .hide {
        display:none;
      }
      
      @keyframes spinner {
        0% { 
          transform: rotate(0deg);
        }
        100% { 
          transform: rotate(360deg);
        }
      }

    `;
    this.shadow.innerHTML = `
    <div class="container">
      <button class="button" >
        ${this.text}
      </button>
      </div>
    `;
    if (this.type === "loader") {
      this.addLoading()
    }
    this.shadow.appendChild(style);
    this.addListeners()
  }
}

customElements.define("btn-component", ButtonComponent);


