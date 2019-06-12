const sessionTokenURL = 'https://opentdb.com/api_token.php?command=request'
const quizURL = 'https://opentdb.com/api.php'
// const sessionTokenURL = 'http://localhost:3000/session'
// const quizURL = 'http://localhost:3000/quiz'
const settings = document.querySelector('#settings')
const quiz = document.querySelector('#quiz')
const userMessages = document.querySelector('#user-messages')
const triviaMsg = document.querySelector('.alert')
const questionElement = document.querySelector('#question')
const choicesElement = document.querySelector('#choices')
const scoreElement = document.querySelector('#score')
const nextButton = document.querySelector('div > button')
const token_key = 'trivia-token'

let totalQuestionsAsked = 0
scoreElement.textContent = '0 of 0'

async function handleForm() {
  let gameOptions = encodeGameOptions()

  let { questions, error } = await loadQuestions(gameOptions)
  if (!!error) {
    await handleError(error)
    return
  }
  clearSettingsForm()
  let questionIndex = 0
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
      data = await loadQuestions(gameOptions)
      let error = data.error
      if (!!error) {
        await handleError(error)
        return
      }
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

async function loadQuestions(gameOptions) {
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
  const existingToken = sessionStorage.getItem(token_key)
  if (!!existingToken) {
    return existingToken
  }
  const response = await fetch(sessionTokenURL)
  const { response_code, token } = await response.json()

  if (response_code > 0) {
    throw new Error('failed to get session token')
  }
  sessionStorage.setItem(token_key, token)
  return token
}

async function resetSessionToken() {
  const existingToken = sessionStorage.getItem(token_key)
  if (!!existingToken) {
    const resetTokenURL = `https://opentdb.com/api_token.php?command=reset&token=${existingToken}`

    const response = await fetch(resetTokenURL)
    const { response_code, token } = await response.json()

    if (response_code === 0) {
      sessionStorage.setItem(token_key, token)
    } else {
      console.error('failed to reset session token:', response_code)
    }
  }
}

function showQuestion({ question, correct_answer, incorrect_answers }) {
  quiz.classList.remove('spinner')
  questionElement.textContent = htmlDecode(question)
  const choices = [correct_answer, ...incorrect_answers]
  for (const choice of shuffle(choices)) {
    let listItem = document.createElement('li')
    listItem.textContent = htmlDecode(choice)
    let spanItem = document.createElement('span')
    spanItem.appendChild(listItem)
    choicesElement.appendChild(spanItem)
  }
}

function clearQuestion() {
  questionElement.textContent = ''
  var choicesEls = document.querySelectorAll('#choices > span')
  choicesEls.forEach(el => choicesElement.removeChild(el))
  nextButton.classList.remove('show')
  quiz.classList.add('spinner')
}

function ListenForUserAnswer(expected) {
  const choicesEl = document.querySelector('#choices')
  choicesEl.addEventListener('click', e => handleUserAnswer(e, expected), {
    once: true,
  })
}

function handleUserAnswer({ target }, expected) {
  const answer = target.textContent
  const choices = document.querySelectorAll('#choices > span > li')
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

// Code 0: Success Returned results successfully.
// Code 1: No Results Could not return results. The API doesn't have enough questions for your query.
// Code 2: Invalid Parameter Contains an invalid parameter. Arguments passed in aren't valid.
// Code 3: Token Not Found Session Token does not exist.
// Code 4: Token Empty Session Token has returned all possible questions for the specified query. Resetting the Token is necessary.
async function handleError(error) {
  const green = '#4CAF50'
  const blue = '#2196F3'
  const amber = '#ff9800'
  const red = '#f44336'
  const message = triviaMsg.querySelector('.message')
  const setElem = (text, color = red) => {
    triviaMsg.style.background = color
    message.innerHTML = text
  }

  switch (error) {
    case 1:
      setElem(
        `<strong>Warning</strong>: the API doesn't contain enough questions. Please choose again.`,
        amber
      )
      break
    case 2:
      setElem(`<strong>Error</strong>: request contains an invalid parameter!`)
      break
    case 3:
      setElem(`<strong>Error</strong>: token session does not exist.`)
      break
    case 4:
      setElem(
        `<strong>Warning</strong>: returned all possible questions for specified query. Please choose again.`,
        blue
      )
      await resetSessionToken()
      setTimeout(showSettingsForm, 5000)
      break
    default:
      setElem(`<strong>Error</strong>: the server returned error: ${error}`)
  }
  triviaMsg.classList.add('show')
}

function showSettingsForm() {
  settings.classList.remove('hide')
  quiz.classList.remove('show')
}

function clearSettingsForm() {
  settings.classList.add('hide')
  quiz.classList.add('show')
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
