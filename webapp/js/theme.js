// Theme Switching Logic
// Theme Switching Logic
// Safe localStorage wrappers
function getSavedTheme() {
    try {
        return localStorage.getItem('saradakosh-theme');
    } catch (e) {
        return null;
    }
}

function setSavedTheme(theme) {
    try {
        localStorage.setItem('saradakosh-theme', theme);
    } catch (e) {
        console.warn('localStorage is not available');
    }
}

function initTheme() {
    const savedTheme = getSavedTheme() || 'system';
    applyTheme(savedTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (getSavedTheme() === 'system' || !getSavedTheme()) {
            applyTheme('system');
        }
    });
    
    // Bind buttons after DOM loads
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.getAttribute('data-set-theme');
                setSavedTheme(theme);
                applyTheme(theme);
            });
        });
        // Update active button state initially
        updateActiveButton(savedTheme);
    });
}

function applyTheme(theme) {
    let isDark = false;
    if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
        isDark = (theme === 'dark');
    }
    
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    
    updateActiveButton(theme);
}

function updateActiveButton(theme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if(btn.getAttribute('data-set-theme') === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Ensure theme runs immediately
initTheme();
