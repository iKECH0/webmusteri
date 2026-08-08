const { Client } = require('pg');
const axios = require('axios');

async function test() {
  const db = new Client({
    connectionString: 'postgresql://neondb_owner:npg_ayGYsqt9EjC8@ep-sweet-sound-as0htv9f-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  });
  await db.connect();
  const res = await db.query("SELECT value FROM settings WHERE key = 'gemini_api_key'");
  const key = res.rows[0].value;
  console.log('Key length:', key.length);
  const modelsRes = await axios.get('https://generativelanguage.googleapis.com/v1beta/models?key=' + key);
  console.log(modelsRes.data.models.map(m => m.name));
  await db.end();
}
test().catch(console.error);
