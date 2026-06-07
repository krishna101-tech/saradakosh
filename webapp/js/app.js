let events = [];
let hierarchyData = {}; 
let clipboardTextWithLinks = '';
let clipboardTextWithoutLinks = '';

async function initApp() {
    const res = await fetch('data/events.json');
    events = await res.json();
    
    buildHierarchyMap();
    renderTodayInHistory();
    setupSearch();
    renderReportsDirectory();
    renderSchedule();
}

function buildHierarchyMap() {
    events.forEach(e => {
        if(e.child_id && e.child_id !== e.id) {
            if(!hierarchyData[e.child_id]) hierarchyData[e.child_id] = [];
            hierarchyData[e.child_id].push(e);
        }
    });
}

function renderTodayInHistory() {
    // Get actual local date
    const d = new Date();
    const todayDt = d.getDate();
    const todayMn = d.getMonth() + 1;
    
    // Update the title
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('today-title').innerText = `Today in History (${monthNames[d.getMonth()]} ${todayDt})`;
    
    let todayEvents = events.filter(e => e.dt === todayDt && e.mn === todayMn && (!e.child_id || e.child_id === e.id || e.child_id === ""));
    
    let grouped = {};
    todayEvents.forEach(e => {
        let yr = e.yr || 0;
        if(!grouped[yr]) grouped[yr] = [];
        grouped[yr].push(e);
    });
    
    let html = '';
    Object.keys(grouped).sort((a,b) => a-b).forEach(yr => {
        let displayYr = yr == 0 ? "Unknown Year" : yr;
        html += `<div class="year-group">${displayYr}</div>`;
        
        grouped[yr].forEach(e => {
            let childrenRaw = hierarchyData[e.id] || [];
            let children = childrenRaw.filter(c => c.du && c.du.trim() !== "");
            let duText = e.du || "No description";
            
            if(children.length > 0) {
                html += `<button class="accordion"><span class="acc-arrow" style="margin-right: 8px;">&#9654;</span> ${duText}</button>`;
                html += `<div class="panel">`;
                children.forEach(c => {
                    html += `<div class="child-event">${c.du}</div>`;
                });
                html += `</div>`;
            } else {
                html += `<div class="accordion-static"><span class="acc-arrow-empty" style="margin-right: 8px;"></span> ${duText}</div>`;
            }
        });
    });
    
    document.getElementById('today-history').innerHTML = html;
    
    // Attach Accordion listeners
    let acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            let panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }
}

function setupSearch() {
    const input = document.getElementById('search-bar');
    const results = document.getElementById('search-results');
    
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        if(term.length < 3) {
            results.innerHTML = '';
            results.style.display = 'none';
            return;
        }
        
        const matches = events.filter(ev => (ev.du || "").toLowerCase().includes(term)).slice(0, 50);
        
        let html = '';
        matches.forEach(m => {
            const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            let dateParts = [];
            if (m.dt && String(m.dt).trim() !== "" && parseFloat(m.dt) !== 0) dateParts.push(parseInt(m.dt));
            if (m.mn && String(m.mn).trim() !== "" && parseFloat(m.mn) !== 0) {
                let mon = parseInt(m.mn);
                if (mon >= 1 && mon <= 12) dateParts.push(shortMonthNames[mon - 1]);
            }
            if (m.yr && String(m.yr).trim() !== "" && parseFloat(m.yr) !== 0) dateParts.push(parseInt(m.yr));
            let displayDt = dateParts.length > 0 ? dateParts.join(" ") : "?";
            html += `<div class="child-event"><strong>${displayDt}</strong>: ${m.du}</div>`;
        });
        results.innerHTML = html;
        results.style.display = 'block';
    });
}

function renderReportsDirectory() {
    const reportsGrid = document.getElementById('reports-directory');
    
    const reports = [
        { file: 'reports/Generated_Ref_Report.html', title: 'Book References', desc: 'A hierarchical view of references, nested by category.' },
        { file: 'reports/Vivekananda.html', title: 'Swami Vivekananda', desc: 'Static HTML report.' },
        { file: 'reports/Mega_Period.html', title: 'Major Periods of our History', desc: 'Static HTML report.' }
    ];
    
    let html = '';
    reports.forEach(r => {
        let target = 'target="_blank"';
        html += `
            <a href="${r.file}" ${target} class="report-card">
                <h3>${r.title}</h3>
            </a>
        `;
    });
    
    reportsGrid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initApp);

function formatDateRange(start, end) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const startDay = start.getDate();
    const startMonth = monthNames[start.getMonth()];
    const endDay = end.getDate();
    const endMonth = monthNames[end.getMonth()];

    if (startMonth === endMonth) {
        return `${startDay} - ${endDay} ${startMonth}`;
    } else {
        return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    }
}

function renderSchedule() {
    if (typeof scheduleConfig === 'undefined' || !scheduleConfig.startDate) {
        document.getElementById('schedule-container').innerHTML = '<p style="color:#888;">Schedule data not configured.</p>';
        return;
    }
    
    const container = document.getElementById('schedule-container');
    const meetBtn = document.getElementById('google-meet-link-btn');
    if(meetBtn) meetBtn.href = scheduleConfig.googleMeetLink || '#';

    const initialStartDate = new Date(scheduleConfig.startDate + 'T00:00:00');
    const effectiveDate = new Date();
    
    // Adjust to Monday
    if (effectiveDate.getDay() === 6) { // Saturday
        effectiveDate.setDate(effectiveDate.getDate() + 2);
    } else if (effectiveDate.getDay() === 0) { // Sunday
        effectiveDate.setDate(effectiveDate.getDate() + 1);
    }
    effectiveDate.setHours(0, 0, 0, 0);

    const diffTime = effectiveDate.getTime() - initialStartDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeksPassed = diffDays >= 0 ? Math.floor(diffDays / 7) : 0;
    
    const topics = scheduleConfig.topics;
    if (!topics || topics.length === 0) return;
    
    const currentTopicIndex = weeksPassed % topics.length;
    const displayTopics = [...topics.slice(currentTopicIndex), ...topics.slice(0, currentTopicIndex)];
    
    const currentWeeksMonday = new Date(effectiveDate);
    currentWeeksMonday.setDate(effectiveDate.getDate() - (effectiveDate.getDay() === 0 ? 6 : effectiveDate.getDay() - 1));

    let html = '';
    const baseText = `*Morning Classes*\nMon to Fri @7.45 am\n\n*Google meet*\n${scheduleConfig.googleMeetLink || ''}\n\n`;
    let tempClipboardWithLinks = baseText;
    let tempClipboardWithoutLinks = baseText;

    for (let i = 0; i < displayTopics.length; i++) {
        const topic = displayTopics[i];
        const weekStartDate = new Date(currentWeeksMonday);
        weekStartDate.setDate(weekStartDate.getDate() + i * 7);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 4);
        const dateRange = formatDateRange(weekStartDate, weekEndDate);
        
        const isCurrentWeek = i === 0;
        const currentClass = isCurrentWeek ? 'current' : '';
        
        html += `
            <div class="schedule-card ${currentClass}">
                <div class="schedule-card-content">
                    <span class="schedule-date">${dateRange} </span>
                    <span class="schedule-title">${topic.name}</span>
                </div>
            </div>
        `;
        
        tempClipboardWithLinks += `*${dateRange}* ${topic.name} ${topic.link ? topic.link : ''}\n\n`;
        tempClipboardWithoutLinks += `*${dateRange}* ${topic.name}\n\n`;
    }

    container.innerHTML = html;
    clipboardTextWithLinks = tempClipboardWithLinks.trim();
    clipboardTextWithoutLinks = tempClipboardWithoutLinks.trim();

    setupCopyButton();
}

function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

function setupCopyButton() {
    const copyButton = document.getElementById('copy-button');
    if (!copyButton) return;
    
    let clickTimeout = null;
    
    const copyToClipboard = (withLinks) => {
        const text = withLinks ? clipboardTextWithLinks : clipboardTextWithoutLinks;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(`Schedule ${withLinks ? 'with links' : 'without links'} copied!`);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                fallbackCopyTextToClipboard(text, withLinks);
            });
        } else {
            fallbackCopyTextToClipboard(text, withLinks);
        }
    };

    const fallbackCopyTextToClipboard = (text, withLinks) => {
        let helper = document.getElementById('clipboard-helper');
        if(!helper) {
            helper = document.createElement('textarea');
            helper.id = 'clipboard-helper';
            helper.style.position = 'absolute';
            helper.style.left = '-9999px';
            document.body.appendChild(helper);
        }
        helper.value = text;
        helper.select();
        try {
            document.execCommand('copy');
            showToast(`Schedule ${withLinks ? 'with links' : 'without links'} copied!`);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            showToast("Failed to copy.");
        }
    };

    copyButton.addEventListener('click', () => {
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
            copyToClipboard(false);
        }, 200);
    });

    copyButton.addEventListener('dblclick', () => {
        clearTimeout(clickTimeout);
        copyToClipboard(true);
    });
}


