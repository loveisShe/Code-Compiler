
const problemDetails = document.querySelector("#problemDetails");
const codeEditor = document.querySelector("#codeEditor");
const language = document.querySelector("#language");
const runButton = document.querySelector("#runButton");
const output = document.querySelector("#output");

// Starter templates
const starterTemplates = {
    javascript: `function solve(input) {
    // Write your solution here

}

console.log(solve("test"));`,

    python: `def solve(input):
    # Write your solution here
    pass


print(solve("test"))`,

    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your solution here
    }
}`,

    cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Write your solution here

    return 0;
}`
};

// Change starter code when language changes
function loadStarterCode() {
    codeEditor.value = starterTemplates[language.value] || "";
    output.textContent = "Your output will appear here.";
}

language.addEventListener("change", loadStarterCode);

// Load question from JSON
async function loadProblem() {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get("id"));

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Invalid question ID.");
        }

        const response = await fetch("data/questions.json");

        if (!response.ok) {
            throw new Error("Unable to load questions.json.");
        }

        const questions = await response.json();

        const question = questions.find(item => item.id === id);

        if (!question) {
            throw new Error("Question not found.");
        }

        document.title = `CodeTrack | ${question.title}`;

        // Title
        const title = document.createElement("h2");
        title.textContent = `${question.id}. ${question.title}`;

        // Difficulty and topic
        const meta = document.createElement("div");
        meta.className = "problem-meta";

        const difficulty = document.createElement("span");
        difficulty.className =
            `difficulty ${String(question.difficulty).toLowerCase()}`;
        difficulty.textContent = question.difficulty;

        const topic = document.createElement("span");
        topic.className = "meta-tag";
        topic.textContent = question.topic;

        meta.append(difficulty, topic);

        // Description
        const description = document.createElement("p");
        description.textContent = question.description;

        problemDetails.replaceChildren(title, meta, description);

        // Examples
        const examplesHeading = document.createElement("h3");
        examplesHeading.textContent = "Examples";

        problemDetails.appendChild(examplesHeading);

        (question.examples || []).forEach((example, index) => {
            const box = document.createElement("div");
            box.className = "example-box";

            const heading = document.createElement("h4");
            heading.textContent = `Example ${index + 1}`;

            const input = document.createElement("pre");
            input.textContent = `Input: ${example.input}`;

            const result = document.createElement("pre");
            result.textContent = `Output: ${example.output}`;

            box.append(heading, input, result);

            if (example.explanation) {
                const explanation = document.createElement("p");
                explanation.textContent =
                    `Explanation: ${example.explanation}`;

                box.appendChild(explanation);
            }

            problemDetails.appendChild(box);
        });

        // Constraints
        const constraintsHeading = document.createElement("h3");
        constraintsHeading.textContent = "Constraints";

        const constraintsList = document.createElement("ul");

        (question.constraints || []).forEach(constraint => {
            const item = document.createElement("li");
            item.textContent = constraint;
            constraintsList.appendChild(item);
        });

        problemDetails.append(
            constraintsHeading,
            constraintsList
        );

    } catch (error) {
        const errorMessage = document.createElement("p");
        errorMessage.textContent = error.message;

        problemDetails.replaceChildren(errorMessage);

        console.error("Problem loading error:", error);
    }
}

// Demo only: does not compile or execute code
runButton.addEventListener("click", () => {
    output.textContent =
        `Demo mode: Actual ${language.value} code execution is not enabled yet.`;
});

// Initialize
loadStarterCode();
loadProblem();
