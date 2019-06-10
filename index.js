// const sessionTokenURL = 'https://opentdb.com/api_token.php?command=request'
// const quizURL = 'https://opentdb.com/api.php'
const sessionTokenURL = 'http://localhost:3000/session'
const quizURL = 'http://localhost:3000/quiz'
const settings = document.querySelector('#settings')
const quiz = document.querySelector('#quiz')
const userMessages = document.querySelector('#user-messages')
const triviaMsg = document.querySelector('trivia-message')
const questionElement = document.querySelector('#question')
const choicesElement = document.querySelector('#choices')
const scoreElement = document.querySelector('#score')
const nextButton = document.querySelector('div > button')

let totalQuestionsAsked = 0
let gameOptions = ''
scoreElement.textContent = '0 of 0'

async function handleForm() {
  gameOptions = encodeGameOptions()

  let { questions, error } = await loadQuestions()
  if (!!error) {
    return handleError(error)
  }

  let questionIndex = 0
  settings.classList.add('hide')
  triviaMsg.classList.remove('show')
  quiz.classList.add('show')

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
    // const response = await fetch(`${quizURL}${gameOptions}&token=${token}`)
    const response = await fetch(`${quizURL}`)
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
  var choicesEls = document.querySelectorAll('#choices > li')
  choicesEls.forEach(el => choicesElement.removeChild(el))
  nextButton.classList.remove('show')
}

function ListenForUserAnswer(expected) {
  const choicesEl = document.querySelector('#choices')
  choicesEl.addEventListener('click', e => handleUserAnswer(e, expected), {
    once: true,
  })
}

function handleUserAnswer({ target }, expected) {
  const answer = target.textContent
  const choices = document.querySelectorAll('#choices > li')
  const elem = [...choices].find(choice => choice.textContent === answer)
  const rest = [...choices].filter(choice => choice.textContent !== answer)

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
  let currentScore = Number(scoreElement.textContent.split(' ')[0])
  currentScore += points
  let percentage = ((currentScore / totalQuestionsAsked) * 100).toFixed(0)
  scoreElement.textContent = `${currentScore} of ${totalQuestionsAsked} (${percentage}%)`
}

function handleError(error) {
  // TODO
  // it's possible to run out of questions
  // what to do, eh?

  // Code 0: Success Returned results successfully.

  // Data Exhausted
  // Code 1: No Results Could not return results. The API doesn't have enough questions for your query.
  // Code 4: Token Empty Session Token has returned all possible questions for the specified query. Resetting the Token is necessary.

  // Developer screwed up
  // Code 2: Invalid Parameter Contains an invalid parameter. Arguments passed in aren't valid.
  // Code 3: Token Not Found Session Token does not exist.
  triviaMsg.textContent = `Error: the server returned error: ${error}`
  triviaMsg.style.setProperty('--background', 'red')
  triviaMsg.classList.add('show')
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
