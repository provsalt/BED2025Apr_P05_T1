import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a email using Resend API.
 * @param {Object} options - { to, subject, html, from }
 * @returns {Promise<boolean>} true if sent, false otherwise
 */
export async function sendEmail({ to, subject, html, from = 'Eldercare <noreply@ngeeann.zip >' }) {
  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
} 