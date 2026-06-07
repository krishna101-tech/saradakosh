let events = [];
let hierarchyData = {}; 

async function initApp() {
    const res = await fetch('data/events.json');
    events = await res.json();
    
    buildHierarchyMap();
    renderTodayInHistory();
    setupSearch();
    renderReportsDirectory();
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
                <p>${r.desc}</p>
            </a>
        `;
    });
    
    reportsGrid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initApp);


