let lives = 5;
let score = 0;
let currentQuestionIndex = 0;
let questionTimer = 30;
let timerInterval;
let correctAnswers = 0;
let consecutiveCorrectAnswers = 0;
let hints = 10;
let hintsUsed = 0;
let maxHintsPerQuestion = 2;
let questions = [];
let soundEnabled = true; // Variable to track sound status

// Load sound effects
const correctSound = new Audio('correct.mp3'); // Replace with the correct path
const wrongSound = new Audio('error.mp3'); // Replace with the correct path

// Shuffle function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

Promise.all([fetch('questions.json').then((response) => response.json())])
  .then(([loadedQuestions]) => {
    questions = shuffleArray(loadedQuestions);
    document.getElementById("startBtn").disabled = false;
  })
  .catch((error) => {
    console.error("Error loading data:", error);
  });

function startGame() {

  const h1Element = document.querySelector("h1");
    if (h1Element) {
      h1Element.remove();
    }

  lives = 5;
  score = 0;
  correctAnswers = 0;
  consecutiveCorrectAnswers = 0;
  hints = 10;
  hintsUsed = 0;

  document.getElementById("startBtn").style.display = 'none';
  document.getElementById("hintBtn").style.display = 'block';
  document.getElementById("hintBtn").innerText = `Hints: ${hints}`;

  document.getElementById("timer").style.display = 'block';
  document.getElementById("lives").style.display = 'block';
  document.getElementById("score").style.display = 'block';

  showQuestion(currentQuestionIndex);
  startQuestionTimer();
}

// Start the question timer
function startQuestionTimer() {
  questionTimer = 30;
  hintsUsed = 0;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    questionTimer--;
    document.getElementById("timer").innerText = `Time: ${questionTimer}s`;

    if (questionTimer <= 0) {
      clearInterval(timerInterval);
      lives--;
      showNotification("Time's up! Moving to the next question.", "red");
      document.body.classList.add("shake");
      setTimeout(() => {
        document.body.classList.remove("shake");
      }, 500);
      nextQuestion();
    }
  }, 1000);
}

// Show question and options
function showQuestion(index) {
  const questionObj = questions[index];
  document.getElementById("question").innerText = questionObj.question;

  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = '';

  questionObj.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.classList.add('button', 'option-btn');
    btn.innerText = option;
    btn.onclick = () => checkAnswer(idx, questionObj.correctAnswer, btn);
    optionsContainer.appendChild(btn);
  });
}

function checkAnswer(selectedIndex, correctAnswer, selectedBtn) {
  const correctIndex = correctAnswer.charCodeAt(0) - 65;

  if (selectedIndex === correctIndex) {
    correctAnswers++;
    score++;
    consecutiveCorrectAnswers++;
    showNotification("Correct!", "green");

    // Play correct answer sound if enabled
    if (soundEnabled) {
      correctSound.play();
    }

    if (correctAnswers % 4 === 0) {
      hints += 3;
      showNotification("You earned 3 extra hints!", "blue");
      document.getElementById("hintBtn").innerText = `Hints: ${hints}`;
    }

    if (consecutiveCorrectAnswers === 7) {
      lives += 2;
      showNotification("You earned 2 extra lives!", "blue");
      consecutiveCorrectAnswers = 0;
    }

  } else {
    lives--;
    consecutiveCorrectAnswers = 0;
    showNotification(`The correct answer is: ${questions[currentQuestionIndex].options[correctIndex]}.`, "red");

    // Play wrong answer sound if enabled
    if (soundEnabled) {
      wrongSound.play();
    }

    // Shake effect for wrong answer
    document.body.classList.add("shake");
    setTimeout(() => {
      document.body.classList.remove("shake");
    }, 500);
  }

  clearInterval(timerInterval);
  nextQuestion();
}

function nextQuestion() {
  currentQuestionIndex++;

  if (lives <= 0) {
    endGame();
  } else if (currentQuestionIndex < questions.length) {
    showQuestion(currentQuestionIndex);
    startQuestionTimer();
  } else {
    endGame();
  }

  updateUI();
}

// Update the UI with current lives and score
function updateUI() {
  document.getElementById("lives").innerText = `Lives: ${lives}`;
  document.getElementById("score").innerText = `Score: ${score}`;
}

// Use a hint
function useHint() {
  if (hints > 0 && hintsUsed < maxHintsPerQuestion) {
    hints--;
    hintsUsed++;
    document.getElementById("hintBtn").innerText = `Hints: ${hints}`;

    const options = document.querySelectorAll('.option-btn');
    const correctIndex = questions[currentQuestionIndex].correctAnswer.charCodeAt(0) - 65;

    const incorrectOptions = Array.from(options).filter((btn, idx) => idx !== correctIndex && !btn.disabled);
    if (incorrectOptions.length > 0) {
      const randomWrong = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
      randomWrong.disabled = true;
      randomWrong.style.opacity = '0.5';
    }
  } else if (hints <= 0) {
    showNotification("No hints left!", "orange");
  } else {
    showNotification("Only 2 hints per question!", "orange");
  }
}

function showNotification(message, color) {
  const notification = document.getElementById('notification');
  notification.innerText = message;
  notification.classList.add('show');
  notification.style.backgroundColor = color;

  setTimeout(() => {
    notification.classList.remove('show');
  }, 1000);
}

// End the game
function endGame() {
  clearInterval(timerInterval);

  document.getElementById("question").style.display = 'none';
  document.getElementById("options").style.display = 'none';
  document.getElementById("timer").style.display = 'none';
  document.getElementById("lives").style.display = 'none';
  document.getElementById("score").style.display = 'none';
  document.getElementById("hintBtn").style.display = 'none';

  const totalScore = document.createElement('p');
  totalScore.id = 'totalScore';
  totalScore.innerText = `Your IQ is: ${100 + score}`;
  document.querySelector('.controls').insertBefore(totalScore, document.getElementById("restartBtn"));

  const heroImage = document.createElement('img');
  const heroImageUrl = "https://cdn-icons-png.flaticon.com/512/7551/7551506.png";
  heroImage.src = heroImageUrl;
  heroImage.alt = `Hero image for score ${score}`;
  heroImage.style.width = '150px';
  document.querySelector('.controls').insertBefore(heroImage, document.getElementById("restartBtn"));

  document.getElementById("restartBtn").style.display = 'block';
  showNotification(`Game Over!`, "red");
}

// Restart the game
function restartGame() {
  location.reload();
}

// Toggle sound on and off
function toggleSound() {
  soundEnabled = !soundEnabled;
  const soundIcon = document.getElementById('soundIcon');
  if (soundEnabled) {
    soundIcon.src = 'on.png'; // Replace with the sound-on icon
    soundIcon.alt = 'Sound On';
  } else {
    soundIcon.src = 'off.png'; // Replace with the sound-off icon
    soundIcon.alt = 'Sound Off';
  }
}
