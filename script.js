const questions = [
    { q: "A mere flicker of control at my heart dictates then fate of a greater force. I do not create, but I command, shaping the strength of what flows through me. Who am I?", a: "BJT || Transistor", room: "AEC Lab" },
    { q: "I devour electrons and return them as brilliance, yet a wrong approach leaves me in darkness. What am I?", a: "LED", room: "Room 303" },
    { q: "I do not move, yet I shape the journey of all who pass through me. Their force weakens in my presence, yet without me, destruction looms. What am I?", a: "Resistor", room: "Room 405" }
];

let attemptCounts = JSON.parse(localStorage.getItem("attemptCounts")) || Array(questions.length).fill(0);
let correctAnswersCount = JSON.parse(localStorage.getItem("correctAnswersCount")) || 0;
let answeredQuestions = JSON.parse(localStorage.getItem("answeredQuestions")) || Array(questions.length).fill(false);
let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || Array(questions.length).fill("");
let quizCompleted = JSON.parse(localStorage.getItem("quizCompleted")) || false;
let roomLocationStored = localStorage.getItem("roomLocation") || ""; 
let quizTimedOut = JSON.parse(localStorage.getItem("quizTimedOut")) || false; // Track if quiz time expired

let timeLeft = JSON.parse(localStorage.getItem("timeLeft"));
if (timeLeft === null) timeLeft = 180; // Set to 3 minutes only if not stored before

const timerElement = document.getElementById("timer");
const roomLocation = document.getElementById("roomLocation");

// Timer Logic
function startTimer() {
    if (quizCompleted) {
        timerElement.style.display = "none"; // Hide timer if quiz is already completed
        return;
    }

    if (quizTimedOut) {
        endQuizDueToTimeout();
        return;
    }

    const timerInterval = setInterval(() => {
        if (correctAnswersCount === questions.length) {
            clearInterval(timerInterval);
            timerElement.style.display = "none"; // Hide timer
        } else if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endQuizDueToTimeout();
        } else {
            timeLeft--;
            localStorage.setItem("timeLeft", JSON.stringify(timeLeft));
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerElement.innerText = `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        }
    }, 1000);
}

function endQuizDueToTimeout() {
    localStorage.setItem("quizTimedOut", JSON.stringify(true)); // Mark quiz as timed out
    timerElement.innerText = "Time's Up!";
    timerElement.style.backgroundColor = "red";

    // Disable all input fields and buttons
    document.querySelectorAll("input, button").forEach((el) => el.disabled = true);
}

// Display Questions
const questionContainer = document.getElementById("questionContainer");
questions.forEach((q, index) => {
    questionContainer.innerHTML += `
        <div class="question">
            <p>${q.q}</p>
            <input type="text" id="answer${index}" value="${userAnswers[index]}" placeholder="Your Answer" ${answeredQuestions[index] ? 'disabled' : ''}>
            <button onclick="checkAnswer(${index})" ${answeredQuestions[index] ? 'disabled' : ''}>Submit</button>
            <p id="feedback${index}" class="feedback" style="color: ${answeredQuestions[index] ? 'green' : 'white'};">
                ${answeredQuestions[index] ? "Correct!" : ""}
            </p>
            <p id="attempts${index}" class="attempt-message">Attempts: ${attemptCounts[index]}</p>
        </div>
    `;
});

// Check Answer Function
function checkAnswer(index) {
    if (quizTimedOut) return; // Prevent checking answers if quiz timed out

    let answerInput = document.getElementById(`answer${index}`);
    let feedbackMessage = document.getElementById(`feedback${index}`);
    let attemptMessage = document.getElementById(`attempts${index}`);
    let button = document.querySelector(`.question:nth-child(${index + 1}) button`);

    let userAnswer = answerInput.value.trim().toLowerCase();
    let correctAnswers = questions[index].a.toLowerCase().split(" || "); // Split possible answers

    if (!userAnswer) return; 

    button.disabled = true;
    button.innerText = "Checking...";
    
    setTimeout(() => {
        attemptCounts[index]++;
        localStorage.setItem("attemptCounts", JSON.stringify(attemptCounts));

        if (correctAnswers.includes(userAnswer)) { 
            feedbackMessage.innerText = "Correct!";
            feedbackMessage.style.color = "green";
            answeredQuestions[index] = true;
            userAnswers[index] = userAnswer;
            answerInput.disabled = true;
            button.disabled = true;
            button.innerText = "Submitted";

            correctAnswersCount++;
            localStorage.setItem("correctAnswersCount", correctAnswersCount);
            localStorage.setItem("answeredQuestions", JSON.stringify(answeredQuestions));
            localStorage.setItem("userAnswers", JSON.stringify(userAnswers));

            if (correctAnswersCount === questions.length) {
                showCompletionMessage();
            }
        } else {
            feedbackMessage.innerText = "Incorrect! Try again.";
            feedbackMessage.style.color = "red";
            button.disabled = false;
            button.innerText = "Submit";
        }

        attemptMessage.innerText = `Attempts: ${attemptCounts[index]}`;
    }, 1500);
}

// Show Completion Message
function showCompletionMessage() {
    let roomNumbers = questions.map((q, index) => 
        `<p><b>${q.room}</b> → ${userAnswers[index]}</p>` 
    ).join("");

    roomLocationStored = `<h3>🎉 Congratulations! You have successfully completed the quiz. 🎉</h3>${roomNumbers}`;
    localStorage.setItem("roomLocation", roomLocationStored);

    roomLocation.innerHTML = roomLocationStored;
    roomLocation.style.display = "block";

    timerElement.style.display = "none";
    quizCompleted = true;
    localStorage.setItem("quizCompleted", JSON.stringify(quizCompleted));

    setTimeout(() => {
        document.getElementById("roomLocation").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1000);
}

// Restore State on Refresh
if (quizCompleted) {
    roomLocation.innerHTML = roomLocationStored;
    roomLocation.style.display = "block";
    timerElement.style.display = "none";
} else if (quizTimedOut) {
    endQuizDueToTimeout(); // Ensure timeout state persists
} else {
    startTimer(); // Start the timer only if quiz is not completed/timed out
}
