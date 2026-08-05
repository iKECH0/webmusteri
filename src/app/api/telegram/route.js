import { NextResponse } from 'next/server';
import db from '@/lib/db';

async function sendTelegramMessage(message) {
  const botToken = db.prepare("SELECT value FROM settings WHERE key = 'telegram_bot_token'").get()?.value;
  const chatId = db.prepare("SELECT value FROM settings WHERE key = 'telegram_chat_id'").get()?.value;

  if (!botToken || !chatId) {
    throw new Error('Telegram Bot Token veya Chat ID eksik.');
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'Telegram error');
  return data;
}

export async function POST(request) {
  try {
    const { type, message } = await request.json();

    let text = message;

    if (type === 'daily_summary') {
      const total = db.prepare('SELECT COUNT(*) as c FROM leads').get().c;
      const noSite = db.prepare('SELECT COUNT(*) as c FROM leads WHERE has_website = 0').get().c;
      const newToday = db.prepare("SELECT COUNT(*) as c FROM leads WHERE date(created_at) = date('now')").get().c;
      const contacted = db.prepare("SELECT COUNT(*) as c FROM leads WHERE status != 'new'").get().c;
      const closed = db.prepare("SELECT COUNT(*) as c FROM leads WHERE status = 'closed'").get().c;
      const revenue = db.prepare('SELECT SUM(revenue) as r FROM leads WHERE status = ?').get('closed').r || 0;

      text = `📊 <b>CRM Günlük Özet</b>

🗓 ${new Date().toLocaleDateString('tr-TR')}

📌 Toplam Kayıt: <b>${total}</b>
🔴 Web Sitesi Yok: <b>${noSite}</b>
🆕 Bugün Eklendi: <b>${newToday}</b>
📞 İletişim Kuruldu: <b>${contacted}</b>
🏆 Kazanılan Müşteri: <b>${closed}</b>
💰 Toplam Gelir: <b>${revenue.toLocaleString('tr-TR')}₺</b>`;
    }

    await sendTelegramMessage(text);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
