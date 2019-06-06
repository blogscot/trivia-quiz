import shuffle from './utils.js'

// const quizURL = 'https://opentdb.com/api.php?amount=10'
const quizURL = 'http://localhost:3000/quiz'
const startButton = document.querySelector('button')
const questionElement = document.querySelector('#question')
const choicesElement = document.querySelector('#choices')
const scoreElement = document.querySelector('#score')
const nextButton = document.querySelector('section > button')

startButton.addEventListener('click', async () => {
  let { questions, error } = await loadQuestions()
  if (!!error) {
    const triviaError = document.querySelector('trivia-error')
    triviaError.innerText = `Error: the server returned error: ${error}`
    triviaError.classList.add('show')
    return
  }

  let questionIndex = 0
  startButton.classList.add('hide')

  let question = questions[questionIndex]
  showQuestion(question)
  ListenForUserAnswer(question.correct_answer)

  nextButton.addEventListener('click', () => {
    // Clear away choices and next button
    var choicesElems = document.querySelectorAll('#choices > li')
    choicesElems.forEach(el => choicesElement.removeChild(el))
    nextButton.classList.remove('show')

    questionIndex++
    if (questionIndex < questions.length) {
      question = questions[questionIndex]
      showQuestion(question)
      ListenForUserAnswer(question.correct_answer)
    }
  })
})

async function loadQuestions() {
  let questions, data
  let error = null
  try {
    const response = await fetch(quizURL)
    data = await response.json()

    const response_code = data.response_code
    questions = data.results

    if (response_code > 0) {
      error = response_code
    }
  } catch (ex) {
    error = ex.message
  } finally {
    return { questions, error }
  }
}

function showQuestion({ question, correct_answer, incorrect_answers }) {
  questionElement.innerHTML = question
  const choices = [correct_answer, ...incorrect_answers]
  for (const choice of shuffle(choices)) {
    let listItem = document.createElement('li')
    listItem.innerText = choice
    choicesElement.appendChild(listItem)
  }
}

function ListenForUserAnswer(expected) {
  const choicesEl = document.querySelector('#choices')
  choicesEl.addEventListener('click', e => handleUserAnswer(e, expected), {
    once: true,
  })
}

function handleUserAnswer({ target }, expected) {
  const answer = target.innerText
  const choices = document.querySelectorAll('#choices > li')
  const elem = [...choices].find(choice => choice.innerText === answer)

  if (answer === expected) {
    updateScore()
    elem.classList.add('correct')
  } else {
    elem.classList.add('incorrect')
  }
  nextButton.classList.add('show')
}

function updateScore() {
  let currentScore = Number(scoreElement.innerText)
  currentScore++
  scoreElement.innerText = currentScore
}
