import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a medication reminder email using Resend API.
 * @param {Object} reminder - Reminder object with email, name, medicine_name, dosage, reason
 * @returns {Promise<boolean>} true if sent, false otherwise
 */
export async function sendReminderEmail(reminder) {
  try {
    const subject = `Medication Reminder: ${reminder.medicine_name}`;
    const html = `<p>Hi ${reminder.name},<br/>
      This is your reminder to take your medication:<br/>
      <b>${reminder.medicine_name}</b><br/>
      Dosage: ${reminder.dosage}<br/>
      Reason: ${reminder.reason}
    </p>`;
    console.log('Attempting to send email to:', reminder.email);
    const result = await resend.emails.send({
      from: 'Eldercare <noreply@ngeeann.zip >',
      to: Array.isArray(reminder.email) ? reminder.email : [reminder.email],
      subject,
      html,
    });
    console.log('Email sent attempted for:', reminder.email, 'Result:', result);
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
} 