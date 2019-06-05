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
  showQuestion(questions[2])
})

function showQuestion({ question, correct_answer, incorrect_answers }) {
  let newQuestion = document.createElement('h1')
  newQuestion.innerHTML = question
  questionElement.appendChild(newQuestion)

  const choices = [correct_answer, ...incorrect_answers]
  for (const choice of shuffle(choices)) {
    let listItem = document.createElement('li')
    listItem.innerText = choice
    choicesElement.appendChild(listItem)
  }
}
