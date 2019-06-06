class TriviaError extends HTMLParagraphElement {
  constructor() {
    super()
  }
}

customElements.define('trivia-error', TriviaError, { extends: 'p' })
