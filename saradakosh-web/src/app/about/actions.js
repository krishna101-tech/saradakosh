'use server';

import fs from 'fs';
import path from 'path';

export async function submitFeedback(formData) {
  const email = formData.get('email')?.toString() || '';
  const reference = formData.get('reference')?.toString() || '';
  const message = formData.get('message')?.toString() || '';
  const type = formData.get('type')?.toString() || 'general';

  if (!email || email.trim() === '') {
    return { success: false, error: 'Email is required for feedback.' };
  }

  if (!message || message.trim() === '') {
    return { success: false, error: 'Message content is required.' };
  }

  const feedbackItem = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    email,
    type,
    reference,
    message
  };

  try {
    // Save locally for developer review
    const filePath = path.resolve(process.cwd(), 'feedback_submissions.json');
    let submissions = [];
    if (fs.existsSync(filePath)) {
      try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        submissions = JSON.parse(fileData);
      } catch (e) {
        console.error("Failed to parse existing feedback file, starting fresh:", e);
      }
    }
    submissions.push(feedbackItem);
    fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));

    // Optional production channel: Discord Webhook notification
    const webhookUrl = process.env.FEEDBACK_DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const color = type === 'correction' ? 16711680 : type === 'suggestion' ? 16753920 : 65280;
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `✏️ New Feedback / Correction (${type.toUpperCase()})`,
            color: color,
            fields: [
              { name: 'Email', value: email, inline: true },
              { name: 'Reference link/ID', value: reference || 'N/A' },
              { name: 'Message', value: message }
            ],
            timestamp: new Date().toISOString()
          }]
        })
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling local feedback log:', error);
    return { success: false, error: 'An error occurred. Please try again later.' };
  }
}
