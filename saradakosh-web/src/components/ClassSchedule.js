'use client';

import { useState, useEffect } from 'react';
import { scheduleConfig } from '@/lib/scheduleConfig';

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

export default function ClassSchedule() {
  const [scheduleData, setScheduleData] = useState([]);
  const [clipboardWithLinks, setClipboardWithLinks] = useState('');
  const [clipboardWithoutLinks, setClipboardWithoutLinks] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (!scheduleConfig.startDate) return;

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

    const newScheduleData = [];
    const baseText = `*Morning Classes*\nMon to Fri @7.45 am\n\n*Google meet*\n${scheduleConfig.googleMeetLink || ''}\n\n`;
    let tempWithLinks = baseText;
    let tempWithoutLinks = baseText;

    for (let i = 0; i < displayTopics.length; i++) {
        const topic = displayTopics[i];
        const weekStartDate = new Date(currentWeeksMonday);
        weekStartDate.setDate(weekStartDate.getDate() + i * 7);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 4);
        const dateRange = formatDateRange(weekStartDate, weekEndDate);
        
        newScheduleData.push({
          dateRange,
          name: topic.name,
          link: topic.link || '#',
          isCurrentWeek: i === 0
        });

        tempWithLinks += `*${dateRange}* ${topic.name} ${topic.link ? topic.link : ''}\n\n`;
        tempWithoutLinks += `*${dateRange}* ${topic.name}\n\n`;
    }

    setScheduleData(newScheduleData);
    setClipboardWithLinks(tempWithLinks.trim());
    setClipboardWithoutLinks(tempWithoutLinks.trim());

  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopy = (withLinks) => {
    const text = withLinks ? clipboardWithLinks : clipboardWithoutLinks;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Schedule ${withLinks ? 'with links' : 'without links'} copied!`);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  };

  return (
    <>
      <div className="schedule-image-container">
        <img className="schedule-image" style={{ display: 'block', margin: '0 auto', width: '50%', maxWidth: '400px' }} src="/images/morning class image.png" alt="Morning Class" />
      </div>
      <header className="schedule-header">
        <h2 className="section-title" style={{ marginTop: 0 }}>Class Schedule</h2>
        <div className="schedule-actions">
          <div className="schedule-buttons">
            <a href={scheduleConfig.googleMeetLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Google Meet</a>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                // Simulate click / double click
                // For simplicity in React without a custom hook, standard click does without links.
                handleCopy(false);
              }}
              onDoubleClick={() => handleCopy(true)}
              title="Click to copy, double click to copy with links"
            >
              Copy for WhatsApp
            </button>
          </div>
        </div>
      </header>
      
      <div className="schedule-list">
        {scheduleData.length === 0 ? (
          <p style={{ color: '#888' }}>Loading schedule...</p>
        ) : (
          scheduleData.map((item, idx) => (
            <div key={idx} className={`schedule-card ${item.isCurrentWeek ? 'current' : ''}`}>
                <div className="schedule-card-content">
                    <span className="schedule-date">{item.dateRange}</span>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="schedule-title">{item.name}</a>
                </div>
            </div>
          ))
        )}
      </div>

      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
