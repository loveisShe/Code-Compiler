// =====================================================
// CodeTrack - Progress & Analytics
// Developed by: Saksham Deep
// Data source: data/submissions.json
// =====================================================

"use strict";

let allSubmissions = [];
let topicChart = null;

// =====================================================
// 1. LOAD SUBMISSIONS FROM JSON
// =====================================================

async function loadSubmissions() {
    const tableBody = document.getElementById("history-body");

    try {
        const response = await fetch("data/submissions.json");

        if (!response.ok) {
            throw new Error("Could not load submissions.json");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Submission data must be a JSON array.");
        }

        allSubmissions = data.filter(submission =>
            submission &&
            typeof submission === "object" &&
            typeof submission.problem === "string" &&
            typeof submission.status === "string"
        );

        updateStatistics();
        updateDifficultyProgress();
        updateTopicChart();
        updateActivity();
        renderSubmissionHistory();

    } catch (error) {
        console.error("CodeTrack Analytics Error:", error);

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="error-message">
                        Unable to load submissions.
                        Please run the project using VS Code Live Server
                        and check data/submissions.json.
                    </td>
                </tr>
            `;
        }
    }
}

// =====================================================
// 2. HELPER FUNCTIONS
// =====================================================

function getAcceptedSubmissions() {
    return allSubmissions.filter(
        submission =>
            submission.status.trim().toLowerCase() === "accepted"
    );
}

function normaliseDifficulty(value) {
    const difficulty = String(value || "")
        .trim()
        .toLowerCase();

    if (difficulty === "easy") return "Easy";
    if (difficulty === "medium") return "Medium";
    if (difficulty === "hard") return "Hard";

    return "Unknown";
}

// A problem is solved if it has at least one accepted submission.
// Problem names act as identifiers in this static demo.

function getSolvedProblems() {
    const solvedProblems = new Map();

    getAcceptedSubmissions().forEach(submission => {
        const problemName = submission.problem.trim();

        if (!problemName) return;

        const key = problemName.toLowerCase();

        if (!solvedProblems.has(key)) {
            solvedProblems.set(key, {
                problem: problemName,
                difficulty: normaliseDifficulty(
                    submission.difficulty
                )
            });
        }
    });

    return solvedProblems;
}

// Validate and parse dates in YYYY-MM-DD format.

function parseISODate(value) {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return null;
    }

    const [year, month, day] = value
        .split("-")
        .map(Number);

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    date.setHours(0, 0, 0, 0);

    return date;
}

function formatDate(date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1)
        .padStart(2, "0");

    const day = String(date.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Safely escape text before inserting it into HTML.

function escapeHTML(value) {
    const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value ?? "").replace(
        /[&<>"']/g,
        character => entities[character]
    );
}

function setText(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}

// =====================================================
// 3. SUMMARY STATISTICS
// =====================================================

function updateStatistics() {
    const totalSubmissions = allSubmissions.length;

    const acceptedSubmissions =
        getAcceptedSubmissions();

    const solvedProblems =
        getSolvedProblems();

    const acceptanceRate =
        totalSubmissions === 0
            ? 0
            : (
                acceptedSubmissions.length /
                totalSubmissions
            ) * 100;

    setText(
        "total-submissions",
        totalSubmissions
    );

    setText(
        "problems-solved",
        solvedProblems.size
    );

    setText(
        "acceptance-rate",
        `${acceptanceRate.toFixed(2)}%`
    );
}

// =====================================================
// 4. DIFFICULTY-WISE UNIQUE SOLVED PROBLEMS
// =====================================================

function updateDifficultyProgress() {
    const container = document.getElementById(
        "difficulty-progress"
    );

    if (!container) return;

    const difficulties = [
        {
            name: "Easy",
            color: "#22c55e"
        },
        {
            name: "Medium",
            color: "#f59e0b"
        },
        {
            name: "Hard",
            color: "#ef4444"
        }
    ];

    const counts = {
        Easy: 0,
        Medium: 0,
        Hard: 0
    };

    const solvedProblems = getSolvedProblems();

    solvedProblems.forEach(problem => {
        if (
            Object.prototype.hasOwnProperty.call(
                counts,
                problem.difficulty
            )
        ) {
            counts[problem.difficulty]++;
        }
    });

    const totalSolved =
        counts.Easy +
        counts.Medium +
        counts.Hard;

    container.innerHTML = difficulties.map(difficulty => {
        const count = counts[difficulty.name];

        const percentage =
            totalSolved === 0
                ? 0
                : (count / totalSolved) * 100;

        return `
            <div class="difficulty-item">

                <div class="difficulty-info">

                    <span class="difficulty-name">

                        <span
                            class="difficulty-dot"
                            style="background:${difficulty.color}"
                        ></span>

                        ${difficulty.name}

                    </span>

                    <span class="difficulty-count">
                        ${count}
                        ${count === 1
                            ? "problem solved"
                            : "problems solved"}
                    </span>

                </div>

                <div
                    class="progress-track"
                    role="progressbar"
                    aria-label="${difficulty.name} solved problems"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow="${percentage.toFixed(1)}"
                >

                    <div
                        class="progress-fill"
                        style="
                            width:${percentage}%;
                            background:${difficulty.color};
                        "
                    ></div>

                </div>

            </div>
        `;
    }).join("");
}

// =====================================================
// 5. TOPIC-WISE PERFORMANCE CHART
// =====================================================

function updateTopicChart() {
    const canvas = document.getElementById("topic-chart");

    if (!canvas) return;

    if (typeof Chart === "undefined") {
        const wrapper = canvas.parentElement;

        if (wrapper) {
            wrapper.innerHTML = `
                <p class="error-message">
                    Chart.js could not load.
                    Check your internet connection and refresh.
                </p>
            `;
        }

        console.warn(
            "Chart.js is unavailable. Other analytics can still run."
        );

        return;
    }

    const topics = {};

    allSubmissions.forEach(submission => {
        const topic = submission.topic || "Other";

        if (!topics[topic]) {
            topics[topic] = {
                accepted: 0,
                unsuccessful: 0
            };
        }

        if (
            submission.status.trim().toLowerCase() === "accepted"
        ) {
            topics[topic].accepted++;
        } else {
            topics[topic].unsuccessful++;
        }
    });

    const labels = Object.keys(topics);

    const acceptedData = labels.map(
        topic => topics[topic].accepted
    );

    const unsuccessfulData = labels.map(
        topic => topics[topic].unsuccessful
    );

    if (topicChart) {
        topicChart.destroy();
    }

    topicChart = new Chart(canvas, {
        type: "bar",

        data: {
            labels: labels,

            datasets: [
                {
                    label: "Accepted submissions",
                    data: acceptedData,
                    backgroundColor: "#22c55e",
                    borderRadius: 5
                },
                {
                    label: "Unsuccessful submissions",
                    data: unsuccessfulData,
                    backgroundColor: "#ef4444",
                    borderRadius: 5
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#a2afc0"
                    }
                },

                tooltip: {
                    mode: "index",
                    intersect: false
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    },

                    ticks: {
                        color: "#a2afc0"
                    }
                },

                y: {
                    beginAtZero: true,

                    ticks: {
                        precision: 0,
                        color: "#a2afc0"
                    },

                    grid: {
                        color: "rgba(162, 175, 192, 0.12)"
                    }
                }
            }
        }
    });
}

// =====================================================
// 6. CODING ACTIVITY AND STREAK
// =====================================================

function updateActivity() {
    const validDates = allSubmissions
        .map(submission =>
            parseISODate(submission.date)
        )
        .filter(Boolean)
        .map(formatDate);

    const uniqueDates = [
        ...new Set(validDates)
    ].sort();

    const dateSet = new Set(uniqueDates);

    setText(
        "active-days",
        uniqueDates.length
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayKey = formatDate(today);

    const yesterday = new Date(today);

    yesterday.setDate(
        yesterday.getDate() - 1
    );

    const yesterdayKey = formatDate(yesterday);

    let currentStreak = 0;
    let streakDate = null;

    // A current streak can start today or yesterday.

    if (dateSet.has(todayKey)) {
        streakDate = new Date(today);
    } else if (dateSet.has(yesterdayKey)) {
        streakDate = new Date(yesterday);
    }

    if (streakDate) {
        while (dateSet.has(formatDate(streakDate))) {
            currentStreak++;

            streakDate.setDate(
                streakDate.getDate() - 1
            );
        }
    }

    // Calculate longest consecutive-day streak.

    let longestStreak = 0;
    let runningStreak = 0;
    let previousDate = null;

    uniqueDates.forEach(dateString => {
        const date = parseISODate(dateString);

        if (!date) return;

        if (previousDate === null) {
            runningStreak = 1;
        } else {
            const difference = Math.round(
                (date - previousDate) /
                (24 * 60 * 60 * 1000)
            );

            runningStreak =
                difference === 1
                    ? runningStreak + 1
                    : 1;
        }

        longestStreak = Math.max(
            longestStreak,
            runningStreak
        );

        previousDate = date;
    });

    setText(
        "current-streak",
        `${currentStreak} days`
    );

    setText(
        "longest-streak",
        `${longestStreak} days`
    );

    renderActivityCalendar(dateSet);
}

// =====================================================
// 7. RECENT 28-DAY ACTIVITY CALENDAR
// =====================================================

function renderActivityCalendar(dateSet) {
    const container = document.getElementById(
        "activity-calendar"
    );

    if (!container) return;

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const days = [];

    for (let offset = 27; offset >= 0; offset--) {
        const date = new Date(today);

        date.setDate(
            today.getDate() - offset
        );

        const key = formatDate(date);

        days.push({
            key: key,

            label: date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short"
            }),

            active: dateSet.has(key)
        });
    }

    container.innerHTML = days.map(day => `
        <div
            class="activity-day ${day.active ? "active" : ""}"
            title="${day.label}${day.active
                ? ": Coding activity"
                : ": No recorded activity"}"
            aria-label="${day.label}${day.active
                ? ": active"
                : ": inactive"}"
        ></div>
    `).join("");
}

// =====================================================
// 8. SUBMISSION HISTORY, SEARCH AND FILTERS
// =====================================================

function renderSubmissionHistory() {
    const tableBody = document.getElementById(
        "history-body"
    );

    if (!tableBody) return;

    const searchInput = document.getElementById(
        "search-problem"
    );

    const difficultyInput = document.getElementById(
        "filter-difficulty"
    );

    const statusInput = document.getElementById(
        "filter-status"
    );

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedDifficulty = difficultyInput
        ? difficultyInput.value
        : "all";

    const selectedStatus = statusInput
        ? statusInput.value
        : "all";

    const filteredSubmissions = allSubmissions
        .filter(submission => {
            const problem = String(
                submission.problem || ""
            ).toLowerCase();

            const topic = String(
                submission.topic || ""
            ).toLowerCase();

            const matchesSearch =
                problem.includes(searchTerm) ||
                topic.includes(searchTerm);

            const matchesDifficulty =
                selectedDifficulty === "all" ||
                normaliseDifficulty(
                    submission.difficulty
                ) === selectedDifficulty;

            const matchesStatus =
                selectedStatus === "all" ||
                submission.status === selectedStatus;

            return (
                matchesSearch &&
                matchesDifficulty &&
                matchesStatus
            );
        })

        // Newest submissions appear first.

        .sort((a, b) => {
            const dateA = parseISODate(a.date);
            const dateB = parseISODate(b.date);

            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;

            return dateB - dateA;
        });

    const countElement = document.getElementById(
        "submission-count"
    );

    if (countElement) {
        countElement.textContent =
            `${filteredSubmissions.length} ${
                filteredSubmissions.length === 1
                    ? "record"
                    : "records"
            }`;
    }

    const messageElement = document.getElementById(
        "table-message"
    );

    if (messageElement) {
        messageElement.textContent =
            `Showing ${filteredSubmissions.length} of ${allSubmissions.length} submissions`;
    }

    if (filteredSubmissions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    No submissions match your search or filters.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = filteredSubmissions.map(submission => {
        const difficulty = normaliseDifficulty(
            submission.difficulty
        );

        const difficultyClass =
            ["Easy", "Medium", "Hard"].includes(difficulty)
                ? difficulty.toLowerCase()
                : "";

        const isAccepted =
            submission.status.trim().toLowerCase() === "accepted";

        const statusClass = isAccepted
            ? "accepted"
            : "unsuccessful";

        return `
            <tr>
                <td class="problem-name">
                    ${escapeHTML(submission.problem || "Unknown")}
                </td>

                <td>
                    ${escapeHTML(submission.topic || "Other")}
                </td>

                <td>
                    <span class="difficulty-badge ${difficultyClass}">
                        ${escapeHTML(difficulty)}
                    </span>
                </td>

                <td>
                    ${escapeHTML(submission.language || "Unknown")}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${escapeHTML(submission.status || "Unknown")}
                    </span>
                </td>

                <td>
                    ${escapeHTML(submission.date || "—")}
                </td>
            </tr>
        `;
    }).join("");
}

// =====================================================
// 9. INITIALISE SEARCH AND FILTERS
// =====================================================

function initialiseAnalyticsControls() {
    const searchInput = document.getElementById(
        "search-problem"
    );

    const difficultyInput = document.getElementById(
        "filter-difficulty"
    );

    const statusInput = document.getElementById(
        "filter-status"
    );

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            renderSubmissionHistory
        );
    }

    if (difficultyInput) {
        difficultyInput.addEventListener(
            "change",
            renderSubmissionHistory
        );
    }

    if (statusInput) {
        statusInput.addEventListener(
            "change",
            renderSubmissionHistory
        );
    }
}

// =====================================================
// 10. START THE ANALYTICS MODULE
// =====================================================

initialiseAnalyticsControls();
loadSubmissions();