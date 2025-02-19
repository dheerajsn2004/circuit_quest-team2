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

let timeLeft = JSON.parse(localStorage.getItem("timeLeft")) || 180; // 3 minutes
const timerElement = document.getElementById("timer");
const roomLocation = document.getElementById("roomLocation");

// Timer Logic
function startTimer() {
    if (quizCompleted) {
        timerElement.style.display = "none"; // Hide timer if quiz is already completed
        return;
    }

    const timerInterval = setInterval(() => {
        if (correctAnswersCount === questions.length || timeLeft <= 0) {
            clearInterval(timerInterval);
            if (correctAnswersCount === questions.length) {
                timerElement.style.display = "none"; // Hide timer
            } else {
                alert("Time's up! The quiz will reset.");
                localStorage.clear();
                location.reload();
            }
        } else {
            timeLeft--;
            localStorage.setItem("timeLeft", timeLeft);
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;

            // Change timer background color only when active
            timerElement.innerText = `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
            timerElement.style.backgroundColor = timeLeft > 0 ? "transparent" : "red";
        }
    }, 1000);
}

startTimer();

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
    let answerInput = document.getElementById(`answer${index}`);
    let feedbackMessage = document.getElementById(`feedback${index}`);
    let attemptMessage = document.getElementById(`attempts${index}`);
    let button = document.querySelector(`.question:nth-child(${index + 1}) button`);

    let userAnswer = answerInput.value.trim().toLowerCase();
    let correctAnswers = questions[index].a.toLowerCase().split(" || "); // Split possible answers

    if (!userAnswer) return; 

    // Disable button and show "Checking..."
    button.disabled = true;
    button.innerText = "Checking...";
    
    setTimeout(() => {
        attemptCounts[index]++;
        localStorage.setItem("attemptCounts", JSON.stringify(attemptCounts));

        if (correctAnswers.includes(userAnswer)) { // Check if user answer matches any correct answer
            feedbackMessage.innerText = "Correct!";
            feedbackMessage.style.color = "green"; // Keep text green
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
            button.disabled = false; // Re-enable button
            button.innerText = "Submit"; // Reset button text
        }

        attemptMessage.innerText = `Attempts: ${attemptCounts[index]}`;
    }, 1500); // Delay of 1.5 seconds before showing the result
}


// Show Completion Message and Room Number
// Show Completion Message and Scroll Down
// Show Completion Message and Scroll Down
function showCompletionMessage() {
    let roomNumbers = questions.map((q, index) => 
        `<p><b>${q.room}</b> → ${userAnswers[index]}</p>` // Show user input instead of predefined answer
    ).join("");

    roomLocationStored = `<h3>🎉 Congratulations! You have successfully completed the quiz. 🎉</h3>${roomNumbers}`;
    localStorage.setItem("roomLocation", roomLocationStored);

    roomLocation.innerHTML = roomLocationStored;
    roomLocation.style.display = "block";

    timerElement.style.display = "none";
    quizCompleted = true;
    localStorage.setItem("quizCompleted", JSON.stringify(quizCompleted));

    // 🔽 Auto-scroll to the room location smoothly
    setTimeout(() => {
        document.getElementById("roomLocation").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1000); // Adding a delay for smooth experience
}



// Restore State on Refresh
if (quizCompleted) {
    roomLocation.innerHTML = roomLocationStored;
    roomLocation.style.display = "block";
}
