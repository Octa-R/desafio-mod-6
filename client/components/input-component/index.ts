class InputComponent extends HTMLElement {
  shadow: ShadowRoot;
  placeholder: string;
  listener: () => any;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.placeholder = this.getAttribute("placeholder") || "";
  }
  connectedCallback() {
    this.render();
  }
  getValue() {
    const el: HTMLInputElement = <HTMLInputElement>this.shadow.querySelector(".input")
    return el.value;
  }
  render() {
    const style = document.createElement("style");
    style.innerHTML = `
      .container {
        width:100%;
        display:flex;
        align-items:center;
        justify-content-center;
      }
      .input {
        font-family:'Odibee Sans', cursive;
        height:84px;
        width:368px;
        background-color: #eee;
        border: 10px solid var(--azul-oscuro);
        border-radius: 10px;
        color:black;
        font-size: 45px;
        margin:0 auto;
      }

    `;
    this.shadow.innerHTML = `
      <div class="container">
        <input class="input" type="text"  placeholder="${this.placeholder}" required>
      </div>
    `;
    this.shadow.appendChild(style);
  }
}

customElements.define("input-component", InputComponent);
