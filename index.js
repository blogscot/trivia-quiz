const sessionTokenURL = 'https://opentdb.com/api_token.php?command=request'
const quizURL = 'https://opentdb.com/api.php'
// const sessionTokenURL = 'http://localhost:3000/session'
// const quizURL = 'http://localhost:3000/quiz'
const startButton = document.querySelector('button')
const questionElement = document.querySelector('#question')
const choicesElement = document.querySelector('#choices')
const scoreElement = document.querySelector('#score')
const nextButton = document.querySelector('section > button')

let totalQuestionsAsked = 0
let gameOptions = ''
scoreElement.textContent = '0 of 0'

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
      // TODO
      // it's possible to run out of questions
      // what to do, eh?
      questions = data.questions
      questionIndex = 0
      question = questions[questionIndex]
      showQuestion(question)
      ListenForUserAnswer(question.correct_answer)
    }
  })
})

function handleForm() {
  gameOptions = encodeGameOptions()
  console.log(quizURL + gameOptions)
}

function encodeGameOptions() {
  const config = {
    trivia_amount: document.myForm.trivia_amount.value,
    trivia_category: document.myForm.trivia_category.value,
    trivia_difficulty: document.myForm.trivia_difficulty.value,
    trivia_type: document.myForm.trivia_type.value,
  }
  let options = `?amount=${config.trivia_amount}`
  if (config.trivia_category !== 'any') {
    options += `&category=${config.trivia_category}`
  }
  if (config.trivia_difficulty !== 'any') {
    options += `&difficulty=${config.trivia_difficulty}`
  }
  if (config.trivia_type !== 'any') {
    options += `&type=${config.trivia_type}`
  }
  return options
}

async function loadQuestions() {
  let questions, data
  let error = null
  try {
    const token = await getSessionToken()
    const response = await fetch(`${quizURL}${gameOptions}&token=${token}`)
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
  questionElement.textContent = htmlDecode(question)
  const choices = [correct_answer, ...incorrect_answers]
  for (const choice of shuffle(choices)) {
    let listItem = document.createElement('li')
    listItem.textContent = htmlDecode(choice)
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
  const rest = [...choices].filter(choice => choice.innerText !== answer)

  totalQuestionsAsked++

  if (answer === expected) {
    displayScore(1)
    elem.classList.add('correct')
  } else {
    displayScore()
    elem.classList.add('incorrect')
  }
  rest.forEach(elem => elem.classList.add('ignore'))
  nextButton.classList.add('show')
}

function displayScore(points = 0) {
  let currentScore = Number(scoreElement.innerText.split(' ')[0])
  currentScore += points
  let percentage = ((currentScore / totalQuestionsAsked) * 100).toFixed(0)
  scoreElement.innerText = `${currentScore} of ${totalQuestionsAsked} (${percentage}%)`
}

// Utils

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
