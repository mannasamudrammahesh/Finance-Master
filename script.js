let currentPoints = 0;
let currentStreak = 0;
let currentLevel = 1;
let currentQuestions = [];
let currentQuestionIndex = 0;

// Initialize points system
function updatePoints(points) {
    currentPoints += points;
    currentStreak = points > 0 ? currentStreak + 1 : 0;
    currentLevel = Math.floor(currentPoints / 100) + 1;

    document.getElementById('pointsDisplay').textContent = `Points: ${currentPoints}`;
    document.getElementById('streakDisplay').textContent = `Streak: ${currentStreak}`;
    document.getElementById('levelDisplay').textContent = `Level: ${currentLevel}`;
}

// Category Selection
function selectCategory(category) {
    document.getElementById('welcome-screen').classList.add('hidden');
    if (category === 'student') {
        document.getElementById('student-section').classList.remove('hidden');
    } else {
        document.getElementById('adult-section').classList.remove('hidden');
    }
}

// Quiz Functions
async function startQuiz(level) {
    try {
        const response = await fetch(`http://localhost:5000/api/quiz/${level}`);
        currentQuestions = await response.json();
        currentQuestionIndex = 0;
        document.querySelector('.level-buttons').classList.add('hidden');
        document.getElementById('quiz-container').classList.remove('hidden');
        displayQuestion();
    } catch (error) {
        console.error('Error fetching quiz:', error);
    }
}

function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;

    document.getElementById('progress').style.width = `${progress}%`;
    document.getElementById('question-text').textContent = question.question;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => checkAnswer(index, question.correct);
        optionsContainer.appendChild(optionDiv);
    });
}

function checkAnswer(selectedIndex, correctIndex) {
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.style.pointerEvents = 'none');

    if (selectedIndex === correctIndex) {
        options[selectedIndex].classList.add('correct');
        showFeedback(true);
        updatePoints(10);
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[correctIndex].classList.add('correct');
        showFeedback(false);
        updatePoints(-1);
    }

    document.getElementById('next-btn').classList.remove('hidden');
}

function showFeedback(isCorrect) {
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden');
    feedback.className = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
    feedback.textContent = isCorrect ? 'Correct! +10 points' : 'Incorrect. -1 point';
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        displayQuestion();
        document.getElementById('feedback').classList.add('hidden');
        document.getElementById('next-btn').classList.add('hidden');
    } else {
        showQuizComplete();
    }
}

function showQuizComplete() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <h2>Quiz Complete!</h2>
        <p>Total Points: ${currentPoints}</p>
        <p>Highest Streak: ${currentStreak}</p>
        <button onclick="location.reload()">Start New Quiz</button>
    `;
}

// Adult Section Functions
async function getFinancialAdvice() {
    const planningType = document.getElementById('planning-type').value;
    const details = document.getElementById('planning-details').value;

    try {
        const response = await fetch('http://localhost:5000/api/finance_planning', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ planning_type: planningType, details })
        });

        const advice = await response.json();
        displayAdvice(advice);
    } catch (error) {
        console.error('Error getting advice:', error);
    }
}

function displayAdvice(advice) {
    const adviceContainer = document.getElementById('advice-container');
    adviceContainer.classList.remove('hidden');
    adviceContainer.innerHTML = `
        <h3>Financial Advice</h3>
        <div class="advice-content">
            ${advice.recommendations.map(rec => `<p>• ${rec}</p>`).join('')}
        </div>
    `;
}
