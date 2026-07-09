'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download } from 'lucide-react';
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
      <Button variant="outline" size="sm" onClick={handleShare} className="w-full min-h-[44px] rounded-full border-quotes-primary text-quotes-primary hover:bg-quotes-primary/5 cursor-pointer">
        <Share2 className="size-4 mr-1" /> Share
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownload} className="w-full min-h-[44px] rounded-full border-quotes-primary text-quotes-primary hover:bg-quotes-primary/5 cursor-pointer">
        <Download className="size-4 mr-1" /> Download
      </Button>
    </>
  );
}
