import { query } from '../db.js';

export async function createNotification({
  userId,
  type,
  title,
  message,
  link = null
}) {
  await query(
    `INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      link,
      is_read,
      created_at
    ) VALUES (
      :userId,
      :type,
      :title,
      :message,
      :link,
      0,
      NOW()
    )`,
    {
      userId,
      type,
      title,
      message,
      link
    }
  );
}