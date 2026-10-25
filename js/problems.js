
const questionsContainer = document.querySelector("#questionsContainer");
const searchInput = document.querySelector("#searchInput");
const topicFilter = document.querySelector("#topicFilter");
const difficultyFilter = document.querySelector("#difficultyFilter");
const questionCount = document.querySelector("#questionCount");

const totalQuestions = document.querySelector("#totalQuestions");
const easyCount = document.querySelector("#easyCount");
const mediumCount = document.querySelector("#mediumCount");
const hardCount = document.querySelector("#hardCount");

let questions = [];

// Load questions from JSON
async function loadQuestions() {
    try {
        const response = await fetch("data/questions.json");

        if (!response.ok) {
            throw new Error("Unable to load questions.json");
        }

        questions = await response.json();

        if (!Array.isArray(questions)) {
            throw new Error("Questions data must be a JSON array.");
        }

        updateStatistics();
        loadTopics();
        displayQuestions(questions);

    } catch (error) {
        console.error("Loading error:", error);

        questionCount.textContent = "Could not load questions.";

        questionsContainer.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    Unable to load questions. Check your JSON file and Live Server.
                </td>
            </tr>
        `;
    }
}

// Update total and difficulty counts
function updateStatistics() {
    totalQuestions.textContent = questions.length;

    easyCount.textContent = questions.filter(
        q => q.difficulty.toLowerCase() === "easy"
    ).length;

    mediumCount.textContent = questions.filter(
        q => q.difficulty.toLowerCase() === "medium"
    ).length;

    hardCount.textContent = questions.filter(
        q => q.difficulty.toLowerCase() === "hard"
    ).length;
}

// Populate topic dropdown from JSON
function loadTopics() {
    const topics = [
        ...new Set(questions.map(q => q.topic).filter(Boolean))
    ];

    topics.sort();

    topics.forEach(topic => {
        const option = document.createElement("option");
        option.value = topic;
        option.textContent = topic;
        topicFilter.appendChild(option);
    });
}

// Render question list
function displayQuestions(questionList) {
    questionsContainer.replaceChildren();

    questionCount.textContent =
        `${questionList.length} problem${questionList.length === 1 ? "" : "s"} found`;

    if (questionList.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "empty-state";
        cell.textContent = "No questions found. Try another search.";

        row.appendChild(cell);
        questionsContainer.appendChild(row);
        return;
    }

    questionList.forEach(question => {
        const row = document.createElement("tr");

        // Question number
        const numberCell = document.createElement("td");
        numberCell.className = "problem-number";
        numberCell.textContent = question.id;

        // Question title
        const titleCell = document.createElement("td");
        const titleLink = document.createElement("a");

        titleLink.className = "problem-title";
        titleLink.href =
            `problem-details.html?id=${encodeURIComponent(question.id)}`;
        titleLink.textContent = question.title;

        titleCell.appendChild(titleLink);

        // Difficulty
        const difficultyCell = document.createElement("td");
        const difficultyBadge = document.createElement("span");

        difficultyBadge.className =
            `difficulty ${String(question.difficulty).toLowerCase()}`;

        difficultyBadge.textContent = question.difficulty;
        difficultyCell.appendChild(difficultyBadge);

        // Topic
        const topicCell = document.createElement("td");
        const topicBadge = document.createElement("span");

        topicBadge.className = "topic-tag";
        topicBadge.textContent = question.topic;

        topicCell.appendChild(topicBadge);

        // Solve link
        const actionCell = document.createElement("td");
        const solveLink = document.createElement("a");

        solveLink.className = "solve-link";
        solveLink.href =
            `problem-details.html?id=${encodeURIComponent(question.id)}`;
        solveLink.textContent = "Solve →";

        actionCell.appendChild(solveLink);

        row.append(
            numberCell,
            titleCell,
            difficultyCell,
            topicCell,
            actionCell
        );

        questionsContainer.appendChild(row);
    });
}

// Search and filters
function filterQuestions() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedTopic = topicFilter.value;
    const selectedDifficulty = difficultyFilter.value;

    const filteredQuestions = questions.filter(question => {
        const matchesSearch =
            question.title.toLowerCase().includes(searchTerm) ||
            question.topic.toLowerCase().includes(searchTerm);

        const matchesTopic =
            selectedTopic === "All" ||
            question.topic === selectedTopic;

        const matchesDifficulty =
            selectedDifficulty === "All" ||
            question.difficulty === selectedDifficulty;

        return matchesSearch && matchesTopic && matchesDifficulty;
    });

    displayQuestions(filteredQuestions);
}

searchInput.addEventListener("input", filterQuestions);
topicFilter.addEventListener("change", filterQuestions);
difficultyFilter.addEventListener("change", filterQuestions);

// Start
loadQuestions();
