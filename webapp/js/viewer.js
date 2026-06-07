let currentEvents = [];
let currentView = 'outline';

async function initViewer() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramIdStr = urlParams.get('paramId');
    const paramNameStr = urlParams.get('paramName');
    
    if (!paramIdStr && !paramNameStr) {
        document.getElementById('record-title').innerText = 'No Record Selected';
        return;
    }
    
    // Load data
    const [paramsRes, epRes, eventsRes] = await Promise.all([
        fetch('data/parameters.json'),
        fetch('data/event_parameters.json'),
        fetch('data/events.json')
    ]);
    
    const params = await paramsRes.json();
    const ep = await epRes.json();
    const allEvents = await eventsRes.json();
    window.globalAllEvents = allEvents; // Save globally for child mapping
    
    let paramId = parseInt(paramIdStr);
    let paramName = paramNameStr;
    let paramIds = [];
    
    function normalizeStr(str) {
        if (!str) return "";
        return str.replace(/\s+/g, ' ').trim().toLowerCase();
    }
    
    if (paramId) {
        paramIds.push(paramId);
        if (!paramName) {
            const p = params.find(x => x.id === paramId);
            if (p) paramName = p.para1;
        }
    } else if (paramNameStr) {
        const normalizedParamName = normalizeStr(paramNameStr);
        const matchingParams = params.filter(x => 
            normalizeStr(x.para1) === normalizedParamName || 
            normalizeStr(x.para1_bengali) === normalizedParamName
        );
        if (matchingParams.length > 0) {
            paramIds = matchingParams.map(p => p.id);
            paramName = matchingParams[0].para1;
        }
    }
    
    if (paramIds.length === 0) {
        document.getElementById('record-title').innerText = 'Record Not Found';
        return;
    }
    
    document.getElementById('record-title').innerText = paramName || 'Record Details';
    
    const eventIds = ep.filter(x => paramIds.includes(x.parameter_id)).map(x => x.event_id);
    currentEvents = allEvents.filter(e => eventIds.includes(e.id));
    
    // Filter out images
    currentEvents = currentEvents.filter(e => !(e.type && e.type.toLowerCase() === 'image'));
    
    // Sort by sequence or year
    // Removed to preserve exact database order since events.json is pre-sorted by sequence.
    
    renderView();
}

function renderView() {
    const container = document.getElementById('content-container');
    const countEl = document.getElementById('record-count');
    
    if (currentEvents.length === 0) {
        countEl.innerText = "";
        container.innerHTML = '<p style="text-align:center;">No DU1 records found for this parameter.</p>';
        return;
    }
    
    countEl.innerText = `Total Records Found: ${currentEvents.length}`;
    
    let html = '';
    
    // Build children map from allEvents
    let childrenMap = {};
    if (window.globalAllEvents) {
        window.globalAllEvents.forEach(e => {
            if (e.child_id && e.child_id !== e.id && e.child_id !== "") {
                if (!childrenMap[e.child_id]) childrenMap[e.child_id] = [];
                childrenMap[e.child_id].push(e);
            }
        });
    }
    
        currentEvents.forEach((e, index) => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let dateParts = [];
        if (e.dt && String(e.dt).trim() !== "" && parseFloat(e.dt) !== 0) dateParts.push(parseInt(e.dt));
        if (e.mn && String(e.mn).trim() !== "" && parseFloat(e.mn) !== 0) {
            let m = parseInt(e.mn);
            if (m >= 1 && m <= 12) dateParts.push(monthNames[m - 1]);
        }
        if (e.yr && String(e.yr).trim() !== "" && parseFloat(e.yr) !== 0) dateParts.push(parseInt(e.yr));
        let yrStr = dateParts.join(" ");
        
        let typeStr = e.type || "";
        
        let duText = e.du || "";
        if (e.ref) duText += ` (${e.ref})`;
        
        let childrenHtml = '';
        
        if (childrenMap[e.id] && childrenMap[e.id].length > 0) {
            let children = childrenMap[e.id];
            children.forEach(child => {
                let childDu = child.du ? child.du.trim() : "";
                if (childDu) {
                    childDu = childDu.replace(/_x000d_|\n/g, '<br>');
                    childrenHtml += `<div class="child-text">${childDu}</div>`;
                }
            });
        } else if (e.du_bengali && e.du_bengali.trim() !== '') {
            let childText = e.du_bengali.trim().replace(/_x000d_|\n/g, '<br>');
            childrenHtml += `<div class="child-text">${childText}</div>`;
        }
        
        let hasChildren = (childrenHtml !== '');
        
        let arrowHtml = hasChildren ? `<span class="acc-arrow">&#9654;</span>` : `<span class="acc-arrow-empty"></span>`;
        let accClass = hasChildren ? 'accordion' : 'accordion-static';
        let accTag = hasChildren ? 'button' : 'div';
        
        html += `<${accTag} class="${accClass}">
                    <div class="acc-row">
                        ${arrowHtml}
                        <span class="acc-seq">${index + 1}</span>
                        <span class="acc-yr">${yrStr}</span>
                        <span class="acc-type">${typeStr}</span>
                        <span class="acc-du">${duText}</span>
                    </div>
                 </${accTag}>`;
                 
        if (hasChildren) {
            html += `<div class="panel">${childrenHtml}</div>`;
        }
    });
    
    container.innerHTML = html;
    
    // Attach accordion listeners
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

document.addEventListener('DOMContentLoaded', initViewer);
