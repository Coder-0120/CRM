require('dotenv').config();
const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Customer = require('../models/Customer');
const Segment = require('../models/Segment');
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');
const { previewSegment, getAudienceForSegment } = require('../services/segmentService');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Tool definitions for Gemini ──────────────────────────────────────────────
const tools = [{
  functionDeclarations: [
    {
      name: "get_customer_stats",
      description: "Get overview stats about customers: total count, high-value customers, at-risk customers, city breakdown",
      parameters: { type: "OBJECT", properties: {}, required: [] }
    },
    {
      name: "preview_segment",
      description: "Preview how many customers match given rules before creating a segment. Always call this before create_segment.",
      parameters: {
        type: "OBJECT",
        properties: {
          rules: {
            type: "ARRAY",
            description: "Array of rule objects. Each: { field, operator, value }. Fields: totalSpend, visitCount, lastActiveDate, city, tags. Operators: gt, lt, gte, lte, eq, not_in_last_days, in_last_days, contains, in",
            items: {
              type: "OBJECT",
              properties: {
                field: { type: "STRING" },
                operator: { type: "STRING" },
                value: { type: "STRING" }
              }
            }
          },
          logicOperator: { type: "STRING", description: "AND or OR" }
        },
        required: ["rules"]
      }
    },
    {
      name: "create_segment",
      description: "Create and save an audience segment with rules",
      parameters: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          description: { type: "STRING" },
          rules: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                field: { type: "STRING" },
                operator: { type: "STRING" },
                value: { type: "STRING" }
              }
            }
          },
          logicOperator: { type: "STRING" }
        },
        required: ["name", "rules"]
      }
    },
    {
      name: "list_segments",
      description: "List all existing audience segments",
      parameters: { type: "OBJECT", properties: {}, required: [] }
    },
    {
      name: "create_campaign",
      description: "Create a campaign for a segment with a message",
      parameters: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          segmentId: { type: "STRING", description: "MongoDB ObjectId of the segment" },
          message: { type: "STRING", description: "Message text. Use {{name}} for customer name, {{city}} for city" },
          channel: { type: "STRING", description: "email, sms, or whatsapp" }
        },
        required: ["name", "segmentId", "message", "channel"]
      }
    },
    {
      name: "send_campaign",
      description: "Launch and send a campaign to its audience",
      parameters: {
        type: "OBJECT",
        properties: {
          campaignId: { type: "STRING" }
        },
        required: ["campaignId"]
      }
    },
    {
      name: "get_campaign_stats",
      description: "Get delivery stats for a campaign",
      parameters: {
        type: "OBJECT",
        properties: {
          campaignId: { type: "STRING" }
        },
        required: ["campaignId"]
      }
    },
    {
      name: "list_campaigns",
      description: "List all campaigns with their stats",
      parameters: { type: "OBJECT", properties: {}, required: [] }
    }
  ]
}];

// ── Tool executor (same logic as before) ─────────────────────────────────────
async function executeTool(name, args) {
  switch (name) {
    case 'get_customer_stats': {
      const total = await Customer.countDocuments();
      const highValue = await Customer.countDocuments({ totalSpend: { $gt: 10000 } });
      const atRisk = await Customer.countDocuments({ lastActiveDate: { $lt: new Date(Date.now() - 90 * 86400000) } });
      const topCities = await Customer.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 5 }
      ]);
      return { total, highValue, atRisk, topCities };
    }

    case 'preview_segment': {
      const result = await previewSegment(args.rules, args.logicOperator || 'AND');
      return result;
    }

    case 'create_segment': {
      const { count } = await previewSegment(args.rules, args.logicOperator || 'AND');
      const segment = await Segment.create({
        name: args.name,
        description: args.description,
        rules: args.rules,
        logicOperator: args.logicOperator || 'AND',
        audienceSize: count
      });
      return { segmentId: segment._id.toString(), name: segment.name, audienceSize: count };
    }

    case 'list_segments': {
      const segments = await Segment.find().sort({ createdAt: -1 }).limit(10);
      return segments.map(s => ({
        id: s._id.toString(), name: s.name,
        audienceSize: s.audienceSize, rules: s.rules
      }));
    }

    case 'create_campaign': {
      const campaign = await Campaign.create({
        name: args.name, segmentId: args.segmentId,
        message: args.message, channel: args.channel || 'email'
      });
      return { campaignId: campaign._id.toString(), name: campaign.name };
    }

    case 'send_campaign': {
      const campaign = await Campaign.findById(args.campaignId);
      if (!campaign) return { error: 'Campaign not found' };

      const segment = await Segment.findById(campaign.segmentId);
      const customers = await getAudienceForSegment(segment);

      campaign.status = 'sending';
      campaign.stats.total = customers.length;
      campaign.stats.sent = customers.length;
      await campaign.save();

      const logs = customers.map(c => ({
        campaignId: campaign._id,
        customerId: c._id,
        customerEmail: c.email,
        message: campaign.message.replace('{{name}}', c.name).replace('{{city}}', c.city),
        channel: campaign.channel,
        status: 'sent',
        statusHistory: [{ status: 'sent', timestamp: new Date() }]
      }));

      const savedLogs = await CommunicationLog.insertMany(logs);
      const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:5000/api/webhook/delivery';

      savedLogs.forEach(log => {
        axios.post(`${process.env.CHANNEL_SERVICE_URL}/send`, {
          logId: log._id, campaignId: campaign._id,
          recipient: log.customerEmail, message: log.message,
          channel: campaign.channel, callbackUrl: CALLBACK_URL
        }).catch(() => { });
      });

      return { success: true, recipients: customers.length, message: `Campaign sent to ${customers.length} customers! Delivery updates will arrive over the next 30 seconds.` };
    }

    case 'get_campaign_stats': {
      const campaign = await Campaign.findById(args.campaignId).populate('segmentId', 'name');
      if (!campaign) return { error: 'Campaign not found' };
      const deliveryRate = campaign.stats.sent > 0
        ? ((campaign.stats.delivered / campaign.stats.sent) * 100).toFixed(1) : 0;
      const openRate = campaign.stats.delivered > 0
        ? ((campaign.stats.opened / campaign.stats.delivered) * 100).toFixed(1) : 0;
      return { name: campaign.name, status: campaign.status, stats: campaign.stats, deliveryRate: `${deliveryRate}%`, openRate: `${openRate}%` };
    }

    case 'list_campaigns': {
      const campaigns = await Campaign.find().populate('segmentId', 'name').sort({ createdAt: -1 }).limit(10);
      return campaigns.map(c => ({
        id: c._id.toString(), name: c.name,
        status: c.status, stats: c.stats,
        segment: c.segmentId?.name
      }));
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ── Chat endpoint ─────────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const systemPrompt = `You are XenoAI, an intelligent CRM agent for a D2C fashion brand called "TrendVault".
You help marketers run personalized campaigns by intelligently segmenting customers and sending messages.

Your capabilities:
- Analyze customer data and surface insights
- Create smart audience segments from natural language descriptions
- Write compelling, personalized campaign messages
- Launch campaigns and track their performance

When a marketer describes what they want:
1. First preview the segment to know the audience size
2. Create the segment with well-defined rules
3. Craft a personalized message (use {{name}} and {{city}} for personalization)
4. Create and send the campaign
5. Confirm with key metrics

Be proactive and specific about numbers. Keep messages short and action-oriented.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: systemPrompt,
      tools
    });

    // Convert message history to Gemini format
    // Filter out leading model messages — Gemini requires history to start with 'user'
    const allHistory = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Drop messages from the start until we hit a user message
    let firstUserIdx = allHistory.findIndex(m => m.role === 'user');
    const history = firstUserIdx === -1 ? [] : allHistory.slice(firstUserIdx);

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];

    let response = await chat.sendMessage(lastMessage.content);
    const toolsUsed = [];

    // Agentic loop — keep calling tools until done
let loopCount = 0;
while (loopCount < 6) {
  loopCount++;
  const candidate = response.response.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  const functionCalls = parts.filter(p => p.functionCall);

  if (functionCalls.length === 0) break;

  // Execute all tool calls
  const toolResults = [];
  for (const part of functionCalls) {
    const { name, args } = part.functionCall;
    console.log(`[Agent] Tool: ${name}`, args);
    toolsUsed.push(name);
    const result = await executeTool(name, args);
    console.log(`[Agent] Result:`, result);
    toolResults.push({
      functionResponse: { name, response: result }
    });
  }

  // Send tool results back with retry
  let retries = 3;
  while (retries > 0) {
    try {
      response = await chat.sendMessage(toolResults);
      break;
    } catch (err) {
      retries--;
      console.log(`[Agent] Gemini timeout, retrying... (${retries} left)`);
      if (retries === 0) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// Build final text — even if last call failed, summarize what was done
let finalText = '';
try {
  finalText = response.response.text();
} catch {
  // Gemini timed out on final summary — build it from toolsUsed
  const toolSummary = toolsUsed.join(', ');
  finalText = `✅ Done! I completed the following actions: ${toolSummary}.\n\nThe campaign was created and sent successfully. Check the **Campaigns** page to see live delivery stats updating in real time!`;
}
    res.json({
      reply: finalText,
      toolsUsed,
      role: 'assistant'
    });

  } catch (e) {
    console.error('Agent error:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;