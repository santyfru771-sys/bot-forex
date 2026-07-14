import makeWASocket from '@adiwajshing/baileys';

export async function sendMessage(text) {
  const sock = makeWASocket();
  await sock.ev.on('connection.update', console.log);
  await sock.ev.on('messages.upsert', console.log);

  const jid = "549XXXXXXXXX@s.whatsapp.net"; // tu número real
  await sock.sendMessage(jid, { text });
}
