require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const STATUSES = ['delivered', 'failed'];
const OPEN_RATE = 0.45;
const CLICK_RATE = 0.20;

async function simulateDelivery(logId, callbackUrl) {
  // Step 1: delivered or failed (2s delay)
  await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
  const isDelivered = Math.random() > 0.1;
  const deliveryStatus = isDelivered ? 'delivered' : 'failed';

  try {
    await axios.post(callbackUrl, { logId, status: deliveryStatus });
  } catch (e) { console.error('Callback failed:', e.message); }

  if (!isDelivered) return;

  // Step 2: opened (10-15s after delivery)
  if (Math.random() < OPEN_RATE) {
    await new Promise(r => setTimeout(r, 10000 + Math.random() * 5000));
    try { await axios.post(callbackUrl, { logId, status: 'opened' }); } catch {}

    // Step 3: clicked (10-15s after open)
    if (Math.random() < CLICK_RATE) {
      await new Promise(r => setTimeout(r, 10000 + Math.random() * 5000));
      try { await axios.post(callbackUrl, { logId, status: 'clicked' }); } catch {}
    }
  }
}

app.post('/send', (req, res) => {
  const { logId, callbackUrl, recipient, message, channel } = req.body;
  if (!logId || !callbackUrl) return res.status(400).json({ error: 'Missing logId or callbackUrl' });

  console.log(`[Channel] Sending to ${recipient} via ${channel}: "${message.slice(0, 40)}..."`);

  // Respond immediately — simulate async
  res.json({ accepted: true, logId });

  // Process asynchronously
  simulateDelivery(logId, callbackUrl);
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Channel service running on port ${PORT}`));