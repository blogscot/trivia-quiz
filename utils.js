function shuffle(answers) {
  let newArray = []

  while (answers.length > 0) {
    let randomIndex = Math.floor(Math.random() * answers.length)
    const entry = answers.splice(randomIndex, 1)
    newArray.push(entry)
  }
  return newArray
}

export default shuffle
