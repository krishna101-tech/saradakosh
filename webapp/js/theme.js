// Theme Switching Logic
function initTheme() {
    const savedTheme = localStorage.getItem('saradakosh-theme') || 'system';
    applyTheme(savedTheme);
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.getAttribute('data-set-theme');
            localStorage.setItem('saradakosh-theme', theme);
            applyTheme(theme);
        });
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('saradakosh-theme') === 'system') {
            applyTheme('system');
        }
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
    
    // Update active button
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
