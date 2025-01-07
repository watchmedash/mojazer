let lives = 5;
let score = 0;
let currentQuestionIndex = 0;
let timer = 60;
let timerInterval;
let correctAnswers = 0;
let questions = [];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

Promise.all([
  fetch('questions.json').then((response) => response.json())
])
  .then(([loadedQuestions]) => {
    questions = shuffleArray(loadedQuestions);
    document.getElementById("startBtn").disabled = false;
  })
  .catch((error) => {
    console.error("Error loading data:", error);
  });

function startGame() {
  lives = 10;
  score = 0;
  correctAnswers = 0;
  currentQuestionIndex = 0;
  timer = 60;

  document.getElementById("startBtn").style.display = 'none';
  document.getElementById("timer").style.display = 'block';
  document.getElementById("lives").style.display = 'block';
  document.getElementById("score").style.display = 'block';

  showQuestion(currentQuestionIndex);
  updateUI();
  startTimer();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer--;
    document.getElementById("timer").innerText = `Time: ${timer}s`;
    if (timer <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function showQuestion(index) {
  const questionObj = questions[index];
  document.getElementById("question").innerText = questionObj.question;

  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = '';

  questionObj.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.classList.add('button');
    btn.innerText = option;
    btn.onclick = () => checkAnswer(idx, questionObj.correctAnswer, btn);
    optionsContainer.appendChild(btn);
  });
}

function checkAnswer(selectedIndex, correctAnswer, selectedBtn) {
  const correctIndex = correctAnswer.charCodeAt(0) - 65;

  if (selectedIndex === correctIndex) {
    correctAnswers++;
    score += 1;
    timer += 15;
    showNotification("Correct!", "green");
  } else {
    lives--;
    showNotification(`Wrong! The correct answer is: ${questions[currentQuestionIndex].options[correctIndex]}.`, "red");
    shakeScreen(selectedBtn);
    highlightAnswer(selectedBtn, correctIndex);
  }

  currentQuestionIndex++;

  if (lives <= 0) {
    endGame();
  } else if (currentQuestionIndex < questions.length) {
    showQuestion(currentQuestionIndex);
  } else {
    endGame();
  }

  updateUI();
}

function updateUI() {
  document.getElementById("lives").innerText = `Lives: ${lives}`;
  document.getElementById("score").innerText = `Score: ${score}`;
}

function showNotification(message, color) {
  const notification = document.getElementById('notification');
  notification.innerText = message;
  notification.classList.add('show');
  notification.style.backgroundColor = color;

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

function shakeScreen(btn) {
  document.body.classList.add('shake');
  setTimeout(() => {
    document.body.classList.remove('shake');
  }, 500);

  btn.classList.add('red');
}

function highlightAnswer(selectedBtn, correctIndex) {
  const buttons = document.querySelectorAll('.button');
  buttons.forEach((btn) => {
    if (btn.innerText === questions[currentQuestionIndex].options[correctIndex]) {
      btn.classList.add('green');
    }
  });
}

function endGame() {
  clearInterval(timerInterval);

  document.getElementById("question").style.display = 'none';
  document.getElementById("options").style.display = 'none';
  document.getElementById("timer").style.display = 'none';
  document.getElementById("lives").style.display = 'none';
  document.getElementById("score").style.display = 'none';

  const totalScore = document.createElement('p');
  totalScore.id = 'totalScore';
  totalScore.innerText = `Wow, your IQ is: ${100 + score}`;
  document.querySelector('.controls').insertBefore(totalScore, document.getElementById("restartBtn"));

  const heroImage = document.createElement('img');
  const heroImageUrl = "https://cdn-icons-png.flaticon.com/512/7551/7551506.png"; // Default image
  heroImage.src = heroImageUrl;
  heroImage.alt = `Hero image for score ${score}`;
  heroImage.style.width = '150px'; // Optional: Adjust the size
  document.querySelector('.controls').insertBefore(heroImage, document.getElementById("restartBtn"));

  document.getElementById("restartBtn").style.display = 'block';
  showNotification(`Game Over! Your score: ${score}`, "red");
}

function restartGame() {
  location.reload(); // Refresh the page to restart the game
}
