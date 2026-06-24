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
      <header className="text-center mb-6 mt-8">
        <div className="mt-4 text-slate-600 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
          <span className="mb-2 sm:mb-0">Morning class: Mon-Fri @7.45 am</span>
          <div className="flex gap-2">
            <a href="https://wa.link/wy4t10" target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-transform transform hover:scale-105 text-sm no-underline">
              Click to Register
            </a>
          </div>
        </div>
      </header>
      
      <div className="schedule-list w-full max-w-4xl mx-auto px-4 mb-8 flex flex-col gap-3">
        {scheduleData.length === 0 ? (
          <p className="text-center text-slate-500">Loading schedule...</p>
        ) : (
          scheduleData.map((item, idx) => (
            <div key={idx} className={`schedule-card ${item.isCurrentWeek ? 'current' : ''} !p-4 !flex !flex-col sm:!flex-row sm:!items-center gap-3 sm:gap-4`}>
                <p className="flex-grow min-w-0 text-left m-0" style={{ color: 'var(--text-color)' }} title={item.name}>
                    <span className="font-bold">{item.dateRange}</span> - <span style={{ opacity: 0.9 }}>{item.name}</span>
                </p>
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
