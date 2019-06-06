function shuffle(answers) {
  let newArray = []

  while (answers.length > 0) {
    let randomIndex = Math.floor(Math.random() * answers.length)
    const entry = answers.splice(randomIndex, 1)
    newArray.push(entry)
  }
  return newArray
}

function unescapeHtml(text) {
  return String(text)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
}

export { shuffle, unescapeHtml }
