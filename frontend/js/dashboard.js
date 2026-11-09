"use strict";

document.addEventListener("DOMContentLoaded", async function () {
    // Default fallback data in case of file:// protocol CORS restrictions
    const defaultData = {
        user: { id: 1, name: "Shally", username: "loveislearning" },
        stats: { totalSolved: 8, totalSubmissions: 12, acceptanceRate: 67, dailyStreak: 2 },
        difficultyCounts: { Easy: 5, Medium: 3, Hard: 0 },
        difficultyTotals: { Easy: 6, Medium: 4, Hard: 3 }
    };

    let users = [];
    let stats = {};
    let submissions = [];
    let questions = [];

    try {
        // Fetch all 4 JSON data sources concurrently
        const [usersRes, statsRes, submissionsRes, questionsRes] = await Promise.all([
            fetch("data/users.json").catch(() => null),
            fetch("data/stats.json").catch(() => null),
            fetch("data/submissions.json").catch(() => null),
            fetch("data/questions.json").catch(() => null)
        ]);

        if (usersRes && usersRes.ok) users = await usersRes.json();
        if (statsRes && statsRes.ok) stats = await statsRes.json();
        if (submissionsRes && submissionsRes.ok) submissions = await submissionsRes.json();
        if (questionsRes && questionsRes.ok) questions = await questionsRes.json();

    } catch (err) {
        console.warn("Could not fetch remote JSON files, loading local defaults:", err);
    }

    // Active User
    const currentUser = (Array.isArray(users) && users.length > 0) ? users[0] : defaultData.user;
    const userStats = (stats && stats[currentUser.id]) ? stats[currentUser.id] : defaultData.stats;

    // Update User Greeting & Header Avatar
    const welcomeHeading = document.getElementById("welcomeHeading");
    const navUserName = document.getElementById("navUserName");
    const navAvatarChar = document.getElementById("navAvatarChar");

    if (welcomeHeading) {
        welcomeHeading.textContent = `Welcome back, ${currentUser.name}! 👋`;
    }
    if (navUserName) {
        navUserName.textContent = currentUser.name;
    }
    if (navAvatarChar) {
        navAvatarChar.textContent = currentUser.name.charAt(0).toUpperCase();
    }

    // Calculate Dynamic Submissions & Acceptance Stats
    const totalSubmissionsCount = Array.isArray(submissions) && submissions.length > 0
        ? submissions.length
        : userStats.totalSubmissions;

    const acceptedSubmissions = Array.isArray(submissions)
        ? submissions.filter(s => String(s.status).trim().toLowerCase() === "accepted")
        : [];

    // Distinct problems solved
    const solvedProblemNames = new Set(acceptedSubmissions.map(s => s.problem));
    const totalSolvedCount = solvedProblemNames.size > 0
        ? solvedProblemNames.size
        : userStats.totalSolved;

    const computedAcceptanceRate = totalSubmissionsCount > 0
        ? Math.round((acceptedSubmissions.length / totalSubmissionsCount) * 100)
        : userStats.acceptanceRate;

    const currentStreakVal = userStats.dailyStreak || defaultData.stats.dailyStreak;

    // Render 4 Stat Boxes (matching the screenshot)
    const problemsSolvedEl = document.getElementById("problemsSolved");
    const totalSubmissionsEl = document.getElementById("totalSubmissions");
    const acceptanceRateEl = document.getElementById("acceptanceRate");
    const currentStreakEl = document.getElementById("currentStreak");

    if (problemsSolvedEl) problemsSolvedEl.textContent = totalSolvedCount;
    if (totalSubmissionsEl) totalSubmissionsEl.textContent = totalSubmissionsCount;
    if (acceptanceRateEl) acceptanceRateEl.textContent = `${computedAcceptanceRate}%`;
    if (currentStreakEl) currentStreakEl.textContent = `${currentStreakVal} days`;

    // Calculate Difficulty Counts
    const diffSolved = { Easy: 0, Medium: 0, Hard: 0 };
    const diffTotal = { Easy: 0, Medium: 0, Hard: 0 };

    if (Array.isArray(questions) && questions.length > 0) {
        questions.forEach(q => {
            const diff = q.difficulty ? (q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase()) : "Easy";
            if (diffTotal[diff] !== undefined) diffTotal[diff]++;
        });
    } else {
        diffTotal.Easy = defaultData.difficultyTotals.Easy;
        diffTotal.Medium = defaultData.difficultyTotals.Medium;
        diffTotal.Hard = defaultData.difficultyTotals.Hard;
    }

    if (acceptedSubmissions.length > 0) {
        const solvedSet = new Set();
        acceptedSubmissions.forEach(sub => {
            if (!solvedSet.has(sub.problem)) {
                solvedSet.add(sub.problem);
                const diff = sub.difficulty
                    ? (sub.difficulty.charAt(0).toUpperCase() + sub.difficulty.slice(1).toLowerCase())
                    : "Easy";
                if (diffSolved[diff] !== undefined) {
                    diffSolved[diff]++;
                }
            }
        });
    } else {
        diffSolved.Easy = defaultData.difficultyCounts.Easy;
        diffSolved.Medium = defaultData.difficultyCounts.Medium;
        diffSolved.Hard = defaultData.difficultyCounts.Hard;
    }

    // Render Difficulty Progress
    renderDifficultyProgress(diffSolved, diffTotal);

    // Render Recent Submissions
    renderRecentSubmissions(submissions, questions);
});

/**
 * Render Difficulty Progress Bars with Smooth Animation
 */
function renderDifficultyProgress(solved, totals) {
    const difficulties = ["Easy", "Medium", "Hard"];

    difficulties.forEach(diff => {
        const lower = diff.toLowerCase();
        const countTextEl = document.getElementById(`${lower}CountText`);
        const fillBarEl = document.getElementById(`${lower}FillBar`);
        const trackEl = document.getElementById(`${lower}Track`);

        const solvedCount = solved[diff] || 0;
        const totalCount = totals[diff] || Math.max(solvedCount, 1);
        const percentage = Math.min(Math.round((solvedCount / Math.max(totalCount, 1)) * 100), 100);

        if (countTextEl) {
            countTextEl.textContent = `${solvedCount} solved`;
        }

        if (fillBarEl) {
            // Trigger animation after render
            setTimeout(() => {
                fillBarEl.style.width = `${percentage}%`;
            }, 60);
        }

        if (trackEl) {
            trackEl.setAttribute("aria-valuenow", percentage);
            trackEl.setAttribute("aria-label", `${diff} difficulty progress: ${solvedCount} of ${totalCount}`);
        }
    });
}

/**
 * Format ISO date string into human friendly format
 */
function formatDate(dateStr) {
    if (!dateStr) return "Recent";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

/**
 * Render Recent Submissions Table with Problem Details Linkage
 */
function renderRecentSubmissions(submissionsList, questionsList) {
    const tbody = document.getElementById("recentSubmissions");
    if (!tbody) return;

    if (!Array.isArray(submissionsList) || submissionsList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    No submissions found. Start practicing to see your attempts here!
                </td>
            </tr>
        `;
        return;
    }

    // Sort submissions descending by date or id
    const sorted = [...submissionsList].sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : a.id || 0;
        const timeB = b.date ? new Date(b.date).getTime() : b.id || 0;
        return timeB - timeA;
    });

    // Show top 6
    const recent = sorted.slice(0, 6);

    tbody.innerHTML = recent.map(sub => {
        // Try finding matching question in questions.json
        const matchedQuestion = Array.isArray(questionsList)
            ? questionsList.find(q =>
                (sub.problemId && q.id === sub.problemId) ||
                (q.title && q.title.toLowerCase() === (sub.problem || "").toLowerCase())
            )
            : null;

        const problemId = matchedQuestion ? matchedQuestion.id : (sub.problemId || 1);
        const problemTitle = sub.problem || (matchedQuestion ? matchedQuestion.title : "DSA Problem");
        const topic = sub.topic || (matchedQuestion ? matchedQuestion.topic : "General");
        const difficulty = sub.difficulty || (matchedQuestion ? matchedQuestion.difficulty : "Easy");
        const diffLower = difficulty.toLowerCase();
        const language = sub.language || "Java";
        const isAccepted = String(sub.status).trim().toLowerCase() === "accepted";
        const formattedDate = formatDate(sub.date);

        return `
            <tr>
                <td>
                    <a href="problem-details.html?id=${encodeURIComponent(problemId)}" class="problem-link">
                        ${escapeHtml(problemTitle)}
                    </a>
                </td>
                <td>
                    <span style="color: #94a3b8; font-size: 13px;">${escapeHtml(topic)}</span>
                </td>
                <td>
                    <span class="badge-diff badge-${diffLower}">${escapeHtml(difficulty)}</span>
                </td>
                <td>
                    <span class="lang-tag">${escapeHtml(language)}</span>
                </td>
                <td>
                    ${isAccepted
                ? `<span class="badge-status status-accepted">✓ Accepted</span>`
                : `<span class="badge-status status-wrong">✕ Wrong Answer</span>`
            }
                </td>
                <td>
                    <span style="color: #64748b; font-size: 12.5px;">${formattedDate}</span>
                </td>
                <td>
                    <a href="problem-details.html?id=${encodeURIComponent(problemId)}" class="btn-solve-link">
                        Solve →
                    </a>
                </td>
            </tr>
        `;
    }).join("");
}

function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
