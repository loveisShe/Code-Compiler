/**
 * CodeTrack - Landing Page Interactions
 * Handles Login/Signup Modal, Tab Switching, and Quick Navigation
 */

"use strict";

function initAuthModal() {
    const modalOverlay = document.getElementById("authModal");
    const openLoginBtns = document.querySelectorAll(".btn-open-login");
    const openSignupBtns = document.querySelectorAll(".btn-open-signup");
    const closeModalBtn = document.getElementById("closeModalBtn");
    
    const tabLogin = document.getElementById("tabLogin");
    const tabSignup = document.getElementById("tabSignup");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const nameGroup = document.getElementById("nameGroup");
    const submitBtn = document.getElementById("authSubmitBtn");
    const authForm = document.getElementById("authForm");

    let currentMode = "login"; // "login" or "signup"

    function setMode(mode) {
        currentMode = mode;
        if (mode === "login") {
            tabLogin.classList.add("active");
            tabSignup.classList.remove("active");
            modalTitle.textContent = "Welcome back";
            modalSubtitle.textContent = "Sign in to access your saved progress and compiler workspace.";
            nameGroup.style.display = "none";
            submitBtn.textContent = "Sign In →";
        } else {
            tabSignup.classList.add("active");
            tabLogin.classList.remove("active");
            modalTitle.textContent = "Create an account";
            modalSubtitle.textContent = "Start tracking your coding journey with deep analytics.";
            nameGroup.style.display = "flex";
            submitBtn.textContent = "Create Account →";
        }
    }

    function openModal(mode = "login") {
        setMode(mode);
        modalOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modalOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    // Event Listeners for Opening Modal
    openLoginBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            openModal("login");
        });
    });

    openSignupBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            openModal("signup");
        });
    });

    // Close Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
            closeModal();
        }
    });

    // Switch Tabs inside Modal
    if (tabLogin) {
        tabLogin.addEventListener("click", () => setMode("login"));
    }
    if (tabSignup) {
        tabSignup.addEventListener("click", () => setMode("signup"));
    }

    // Form submission demo
    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Verifying...";
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = "✓ Success!";
                setTimeout(() => {
                    closeModal();
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }, 800);
            }, 700);
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuthModal);
} else {
    initAuthModal();
}
