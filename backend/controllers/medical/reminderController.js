import { getAllRemindersWithUsers } from '../../models/medical/medicalModel.js';
import { sendReminderEmail } from '../../services/emailService.js';
import { DateTime } from 'luxon';

const sentReminders = {}; // { [date]: { [reminderId]: [array of sent times as 'HH:MM'] } }

function getTodayKey() {
  // Use Singapore date for the key
  return DateTime.now().setZone('Asia/Singapore').toISODate(); // 'YYYY-MM-DD'
}

function  getReminderTimes(baseTime, frequency) {
  if (!baseTime) {
    console.warn('No baseTime provided for reminder');
    return [];
  }

  let hour, minute;

  // If it's a Date object
  if (baseTime instanceof Date) {
    hour = baseTime.getUTCHours(); // Use UTC hours for ISO strings
    minute = baseTime.getUTCMinutes();
  } else if (typeof baseTime === 'string') {
    if (baseTime.includes('T')) {
      const date = new Date(baseTime);
      if (!isNaN(date)) {
        hour = date.getUTCHours();
        minute = date.getUTCMinutes();
      }
    } else {
      const parts = baseTime.split(':');
      hour = Number(parts[0]);
      minute = Number(parts[1]);
    }
  }

  if (typeof hour !== 'number' || typeof minute !== 'number' || isNaN(hour) || isNaN(minute)) {
    console.warn('Invalid hour or minute for reminder:', baseTime, hour, minute);
    return [];
  }

  const times = [];
  // Use Singapore timezone for all calculations
  const sgZone = 'Asia/Singapore';
  const today = DateTime.now().setZone(sgZone).startOf('day');
  for (let i = 0; i < frequency; i++) {
    // Set the time directly in Singapore timezone, then add 4 hours per frequency
    const reminderTime = today.set({ hour, minute }).plus({ hours: i * 4 });
    times.push(reminderTime);
  }
  return times;
}

function timeToHHMM(dt) {
  // dt is a Luxon DateTime
  return dt.toFormat('HH:mm');
}

export async function checkAndSendReminders() {
  console.log('Running reminder check at', DateTime.now().setZone('Asia/Singapore').toISO());
  try {
    const reminders = await getAllRemindersWithUsers();
    console.log('Fetched reminders:', reminders.length);
    const now = DateTime.now().setZone('Asia/Singapore');
    const todayKey = getTodayKey();

    for (const reminder of reminders) {
      // Debug log for raw medicine_time value
      console.log(`DEBUG: Reminder ID ${reminder.id} raw medicine_time:`, reminder.medicine_time);
      const reminderId = reminder.id;
      if (!sentReminders[todayKey]) sentReminders[todayKey] = {};
      if (!sentReminders[todayKey][reminderId]) sentReminders[todayKey][reminderId] = [];

      const reminderTimes = getReminderTimes(reminder.medicine_time, reminder.frequency_per_day);
      console.log(`Reminder ID ${reminderId} times:`, reminderTimes.map(t => t.toFormat('HH:mm:ss ZZZZ')));
      for (const time of reminderTimes) {
        console.log(
          `Now: ${now.toFormat('HH:mm')} | Reminder: ${time.toFormat('HH:mm')} | Reminder ID: ${reminderId}`
        );
        if (now.hour === time.hour && now.minute === time.minute) {
          const hhmm = timeToHHMM(time);
          console.log('Time matched for reminder:', reminderId, 'at', hhmm);
          if (!sentReminders[todayKey][reminderId].includes(hhmm)) {
            console.log('Sending email reminder:', reminderId, 'to', reminder.email);
            await sendReminderEmail(reminder);
            sentReminders[todayKey][reminderId].push(hhmm);
          } else {
            console.log('Already sent for this time:', hhmm, 'reminder:', reminderId);
          }
        }
      }
    }

    // Clean up old days
    const keys = Object.keys(sentReminders);
    for (const key of keys) {
      if (key !== todayKey) delete sentReminders[key];
    }
  } catch (err) {
    console.error('Error checking/sending reminders:', err);
  }
} 