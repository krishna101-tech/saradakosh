'use client';
import React, { useEffect, useState } from 'react';

export default function PostActions({ imageUrl }) {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Swami Vivekananda Quote',
          url: currentUrl
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(currentUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    // Inject fl_attachment to force download from Cloudinary
    let downloadUrl = imageUrl;
    if (downloadUrl.includes('/upload/')) {
      downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
    }
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'vivekananda-quote.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <button onClick={handleShare} className="action-btn btn-primary">
        <span style={{ fontSize:'1.1rem' }}>📤</span> Share
      </button>
      <button onClick={handleDownload} className="action-btn btn-accent">
        <span style={{ fontSize:'1.1rem' }}>⬇️</span> Download
      </button>
    </>
  );
}
