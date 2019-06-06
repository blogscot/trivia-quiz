function shuffle(answers) {
  let newArray = []

  while (answers.length > 0) {
    let randomIndex = Math.floor(Math.random() * answers.length)
    const entry = answers.splice(randomIndex, 1)
    newArray.push(entry)
  }
  return newArray
}

function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, 'text/html')
  return doc.documentElement.textContent
}

export { shuffle, htmlDecode }
