import { shuffle, unescapeHtml } from './utils.js'

const sessionTokenURL = 'https://opentdb.com/api_token.php?command=request'
const quizURL = 'https://opentdb.com/api.php?amount=10'
// const sessionTokenURL = 'http://localhost:3000/session'
// const quizURL = 'http://localhost:3000/quiz'
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

  nextButton.addEventListener('click', async () => {
    clearQuestion()

    questionIndex++
    if (questionIndex < questions.length) {
      question = questions[questionIndex]
      showQuestion(question)
      ListenForUserAnswer(question.correct_answer)
    } else {
      console.log('next round...')
      let data = await loadQuestions()
      questions = data.questions
      questionIndex = 0
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
    const token = await getSessionToken()
    const response = await fetch(`${quizURL}&token=${token}`)
    // const response = await fetch(`${quizURL}`)
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

async function getSessionToken() {
  const key = 'trivia-token'
  const existingToken = sessionStorage.getItem(key)
  if (!!existingToken) {
    return existingToken
  }
  const response = await fetch(sessionTokenURL)
  const { response_code, token } = await response.json()

  if (response_code > 0) {
    throw new Error('failed to get session token')
  }
  sessionStorage.setItem(key, token)
  return token
}

function showQuestion({ question, correct_answer, incorrect_answers }) {
  questionElement.innerHTML = unescapeHtml(question)
  const choices = [correct_answer, ...incorrect_answers]
  for (const choice of shuffle(choices)) {
    let listItem = document.createElement('li')
    listItem.innerText = unescapeHtml(choice)
    choicesElement.appendChild(listItem)
  }
}

function clearQuestion() {
  var choicesElems = document.querySelectorAll('#choices > li')
  choicesElems.forEach(el => choicesElement.removeChild(el))
  nextButton.classList.remove('show')
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
