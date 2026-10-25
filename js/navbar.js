(function () {
    if (!document.querySelector('link[href*="navbar.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/navbar.css';
        document.head.appendChild(link);
    }

    // 2. Sidebar HTML Template
    const sidebarHtml = `
    <aside class="ct-sidebar" id="codeTrackSidebar" aria-label="Main Navigation">
        <div class="sidebar-top">
            <!-- Logo -->
            <a href="dashboard.html" class="sidebar-brand" title="CodeTrack">
                <span class="brand-code-icon">&lt;/&gt;</span>
                <span class="brand-title">CodeTrack</span>
            </a>

            <!-- Vertical Menu Links -->
            <nav>
                <ul class="sidebar-nav-menu">
                    <li>
                        <a href="dashboard.html" class="sidebar-item-link" id="side-dashboard">
                            <span class="sidebar-icon">📊</span>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="problems.html" class="sidebar-item-link" id="side-problems">
                            <span class="sidebar-icon">⚡</span>
                            <span>Problems</span>
                        </a>
                    </li>
                    <li>
                        <a href="history.html" class="sidebar-item-link" id="side-progress">
                            <span class="sidebar-icon">📈</span>
                            <span>Progress</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>

        <!-- User Profile Badge at Bottom of Sidebar -->
        <div class="sidebar-bottom">
            <a href="dashboard.html" class="sidebar-user-card" title="Shally (loveislearning)">
                <div class="sidebar-avatar" id="navAvatarChar">S</div>
                <div class="sidebar-user-details">
                    <span class="sidebar-user-name" id="navUserName">Shally</span>
                    <span class="sidebar-user-handle">loveislearning</span>
                </div>
            </a>
        </div>
    </aside>
    `;

    // 3. Mount sidebar into document
    function mountSidebar() {
        if (document.getElementById('codeTrackSidebar')) return; // Already mounted

        const mountPoint = document.getElementById('navbar-mount') ||
            document.getElementById('sidebar-mount') ||
            document.getElementById('navbar-container');

        if (mountPoint) {
            mountPoint.outerHTML = sidebarHtml;
        } else {
            const appLayout = document.querySelector('.app-layout');
            if (appLayout) {
                appLayout.insertAdjacentHTML('afterbegin', sidebarHtml);
            } else {
                document.body.insertAdjacentHTML('afterbegin', sidebarHtml);
            }
        }

        // 4. Highlight active menu item based on current URL
        const currentPath = window.location.pathname.toLowerCase();
        const sideDashboard = document.getElementById('side-dashboard');
        const sideProblems = document.getElementById('side-problems');
        const sideProgress = document.getElementById('side-progress');

        if (sideDashboard) sideDashboard.classList.remove('active');
        if (sideProblems) sideProblems.classList.remove('active');
        if (sideProgress) sideProgress.classList.remove('active');

        if (currentPath.includes('problems') || currentPath.includes('problem-details')) {
            if (sideProblems) sideProblems.classList.add('active');
        } else if (currentPath.includes('history')) {
            if (sideProgress) sideProgress.classList.add('active');
        } else {
            if (sideDashboard) sideDashboard.classList.add('active');
        }

        // 5. Sync user details if stored in localStorage
        try {
            const storedUser = localStorage.getItem('codeTrackUser');
            if (storedUser) {
                const u = JSON.parse(storedUser);
                const nameEl = document.getElementById('navUserName');
                const avatarEl = document.getElementById('navAvatarChar');
                if (nameEl && u.name) nameEl.textContent = u.name;
                if (avatarEl && u.name) avatarEl.textContent = u.name.charAt(0).toUpperCase();
            }
        } catch (e) { }
    }

    // Run mount on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountSidebar);
    } else {
        mountSidebar();
    }
})();
