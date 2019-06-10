class TriviaMessage extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    const { shadowRoot } = this

    const templateNode = document.getElementById('my-template')
    if (templateNode) {
      const content = document.importNode(templateNode.content, true)
      shadowRoot.appendChild(content)
    } else {
      shadowRoot.innerHTML = `<style>
      :host {
        --background: #0097a7;
        --color: white
      }
      .wrapper {
        color: var(--color);
        background-color: var(--background);
        padding: 8px;
        margin: 8px;
        text-align: center;
        font-size: 1.2rem;
      }
    </style>
    <div class="wrapper"><slot>Hola Mundo</slot></div>`
    }
  }
}

customElements.define('trivia-message', TriviaMessage)
