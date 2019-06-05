import shuffle from './utils.js'

// const quizURL = 'https://opentdb.com/api.php?amount=10'
const quizURL = 'http://localhost:3000/quiz'
const startButton = document.querySelector('button')
const questionElement = document.querySelector('#question')
const choicesElement = document.querySelector('#choices')

startButton.addEventListener('click', async () => {
  const response = await fetch(quizURL)
  const data = await response.json()
  const questions = data.results

  startButton.classList.add('hide')

  // Display first question
  let questionText = questions[0].question
  let newQuestion = document.createElement('h1')
  newQuestion.innerHTML = questionText
  questionElement.appendChild(newQuestion)

  // Display possible answers
  const choices = [
    questions[0].correct_answer,
    ...questions[0].incorrect_answers,
  ]
  console.log(choices)

  for (const choice of shuffle(choices)) {
    let listItem = document.createElement('li')
    listItem.innerText = choice
    choicesElement.appendChild(listItem)
  }
})
