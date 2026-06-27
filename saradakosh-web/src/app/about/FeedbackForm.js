'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitFeedback } from './actions';

export default function FeedbackForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReference(refParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Web3Forms public access key generated for krishnasakhananda@gmail.com
    const accessKey = '48c981b6-bfbb-4f5a-af81-1b6983ce1709';

    try {
      let emailBody = `Feedback Type: ${reference ? 'CORRECTION / ERROR' : 'GENERAL FEEDBACK'}\n`;
      emailBody += `Reply-To Email: ${email}\n\n`;
      emailBody += `Message:\n-----------------------------\n${message}`;
      
      if (reference) {
        emailBody += `\n\n-----------------------------\nOriginal Post Context Link:\nhttps://saradakosh.org${reference}`;
      }

      // Dispatch client-side to bypass Cloudflare bot challenges on serverless runtimes
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: 'Saradakosh Visitor',
          email: email, // Reply-to target
          subject: reference 
            ? `✏️ Saradakosh Correction/Error Report` 
            : `✏️ Saradakosh General Feedback`,
          message: emailBody,
          from_name: 'Saradakosh Archive'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setEmail('');
        setMessage('');
        
        // Log locally to the server backup JSON file
        const logData = new FormData();
        logData.append('email', email);
        logData.append('reference', reference);
        logData.append('message', message);
        logData.append('type', reference ? 'correction' : 'general');
        await submitFeedback(logData); // Execute server log action
        
        setLoading(false);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setLoading(false);
        setError(data.message || 'Failed to send. Please try again.');
      }
    } catch (err) {
      console.error('Email client-side dispatch error:', err);
      setLoading(false);
      setError('Network connection error. Please try again later.');
    }
  };

  return (
    <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 md:p-8 shadow-sm">
      <h3 className="font-serif text-2xl text-primary-theme mb-2">
        {reference ? 'Suggest a Correction / Report Error' : 'Give Feedback'}
      </h3>
      <p className="text-sm text-text-theme opacity-80 mb-6 leading-relaxed">
        {reference 
          ? 'Use this form to submit corrections for the active post. Your email is required so we can reply if we need clarification.'
          : 'We would love to hear your thoughts, feature suggestions, or general feedback about the archive.'}
      </p>

      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium animate-[fadeInUp_0.3s_ease-out]">
          ✓ Thank you! Your feedback has been sent successfully.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium animate-[fadeInUp_0.3s_ease-out]">
          ⚠ Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
        <div className="flex flex-col gap-1.5">
          <label className="font-bold opacity-80 text-text-theme">Your Email (Compulsory)</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. yourname@domain.com" 
            className="p-3 bg-[var(--input-bg)] text-text-theme border border-[var(--input-border)] rounded-lg focus:outline-none focus:border-primary-theme transition-colors duration-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-bold opacity-80 text-text-theme">Message</label>
          <textarea 
            rows={5}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={reference ? "Describe the correction or error in detail..." : "Your feedback or suggestions..."} 
            className="p-3 bg-[var(--input-bg)] text-text-theme border border-[var(--input-border)] rounded-lg focus:outline-none focus:border-primary-theme transition-colors duration-200 resize-y"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-primary-theme text-white font-bold rounded-lg hover:bg-primary-theme/90 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
