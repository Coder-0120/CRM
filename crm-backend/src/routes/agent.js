require('dotenv').config();
const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const Customer = require('../models/Customer');
const Segment = require('../models/Segment');
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');
const { previewSegment, getAudienceForSegment } = require('../services/segmentService');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq   = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are XenoAI, an intelligent CRM agent for a D2C fashion brand called "TrendVault".
You help marketers run personalized campaigns by intelligently segmenting customers and sending messages.

Your capabilities:
- Analyze customer data and surface insights
- Create smart audience segments from natural language descriptions
- Write compelling, personalized campaign messages
- Launch campaigns and track their performance

When a marketer describes what they want:
1. First preview the segment to know the audience size
2. Create the segment with well-defined rules — the response will include a "segmentId" field (a MongoDB ObjectId hex string)
3. Craft a personalized message (use {{name}} and {{city}} for personalization)
4. Call create_campaign using the EXACT "segmentId" value returned by create_segment — NEVER use the segment name, never invent an id
5. Send the campaign and confirm with key metrics

CRITICAL RULE: The segmentId argument for create_campaign MUST be the exact "segmentId" string returned by the create_segment tool call result. It looks like "6847a1c2e3f..." (a 24-character hex string). Never pass a human-readable name like "HighSpenderPune" as the segmentId.

Be proactive and specific about numbers. Keep messages short and action-oriented.`;

// ── GEMINI tool format ───────────────────────────────────────────────────────
const geminiTools = [{
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
              properties: { field: { type: "STRING" }, operator: { type: "STRING" }, value: { type: "STRING" } }
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
          rules: { type: "ARRAY", items: { type: "OBJECT", properties: { field: { type: "STRING" }, operator: { type: "STRING" }, value: { type: "STRING" } } } },
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
      parameters: { type: "OBJECT", properties: { campaignId: { type: "STRING" } }, required: ["campaignId"] }
    },
    {
      name: "get_campaign_stats",
      description: "Get delivery stats for a campaign",
      parameters: { type: "OBJECT", properties: { campaignId: { type: "STRING" } }, required: ["campaignId"] }
    },
    {
      name: "list_campaigns",
      description: "List all campaigns with their stats",
      parameters: { type: "OBJECT", properties: {}, required: [] }
    }
  ]
}];

// ── GROQ / OpenAI tool format ─────────────────────────────────────────────────
const groqTools = [
  { type: "function", function: { name: "get_customer_stats", description: "Get overview stats about customers: total count, high-value customers, at-risk customers, city breakdown", parameters: { type: "object", properties: {}, required: [] } } },
  { type: "function", function: { name: "preview_segment", description: "Preview how many customers match given rules before creating a segment. Always call before create_segment.", parameters: { type: "object", properties: { rules: { type: "array", items: { type: "object", properties: { field: { type: "string" }, operator: { type: "string" }, value: { type: "string" } }, required: ["field","operator","value"] }, description: "Fields: totalSpend, visitCount, lastActiveDate, city, tags. Operators: gt, lt, gte, lte, eq, not_in_last_days, in_last_days, contains, in" }, logicOperator: { type: "string", enum: ["AND","OR"] } }, required: ["rules"] } } },
  { type: "function", function: { name: "create_segment", description: "Create and save an audience segment with rules", parameters: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, rules: { type: "array", items: { type: "object", properties: { field: { type: "string" }, operator: { type: "string" }, value: { type: "string" } } } }, logicOperator: { type: "string" } }, required: ["name","rules"] } } },
  { type: "function", function: { name: "list_segments", description: "List all existing audience segments", parameters: { type: "object", properties: {}, required: [] } } },
  { type: "function", function: { name: "create_campaign", description: "Create a campaign for a segment with a message", parameters: { type: "object", properties: { name: { type: "string" }, segmentId: { type: "string" }, message: { type: "string", description: "Use {{name}} and {{city}} for personalization" }, channel: { type: "string", enum: ["email","sms","whatsapp"] } }, required: ["name","segmentId","message","channel"] } } },
  { type: "function", function: { name: "send_campaign", description: "Launch and send a campaign to its audience", parameters: { type: "object", properties: { campaignId: { type: "string" } }, required: ["campaignId"] } } },
  { type: "function", function: { name: "get_campaign_stats", description: "Get delivery stats for a campaign", parameters: { type: "object", properties: { campaignId: { type: "string" } }, required: ["campaignId"] } } },
  { type: "function", function: { name: "list_campaigns", description: "List all campaigns with their stats", parameters: { type: "object", properties: {}, required: [] } } },
];

// ── Shared tool executor ────────────────────────────────────────────────────
async function executeTool(name, args) {
  switch (name) {
    case 'get_customer_stats': {
      const total     = await Customer.countDocuments();
      const highValue = await Customer.countDocuments({ totalSpend: { $gt: 10000 } });
      const atRisk    = await Customer.countDocuments({ lastActiveDate: { $lt: new Date(Date.now() - 90 * 86400000) } });
      const topCities = await Customer.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 5 }
      ]);
      return { total, highValue, atRisk, topCities };
    }

    case 'preview_segment':
      return await previewSegment(args.rules, args.logicOperator || 'AND');

    case 'create_segment': {
      const { count } = await previewSegment(args.rules, args.logicOperator || 'AND');
      const segment = await Segment.create({
        name: args.name, description: args.description,
        rules: args.rules, logicOperator: args.logicOperator || 'AND', audienceSize: count
      });
      return { segmentId: segment._id.toString(), name: segment.name, audienceSize: count };
    }

    case 'list_segments': {
      const segments = await Segment.find().sort({ createdAt: -1 }).limit(10);
      return segments.map(s => ({ id: s._id.toString(), name: s.name, audienceSize: s.audienceSize, rules: s.rules }));
    }

    case 'create_campaign': {
      // FIX: AI sometimes passes segment name instead of ObjectId -- resolve it
      let segmentId = args.segmentId;
      const isValidObjectId = /^[a-f\d]{24}$/i.test(segmentId);
      if (!isValidObjectId) {
        const found = await Segment.findOne({ name: { $regex: new RegExp(segmentId, 'i') } }).sort({ createdAt: -1 });
        if (!found) return { error: 'Invalid segmentId "' + segmentId + '". Please call create_segment first and use the returned segmentId.' };
        segmentId = found._id.toString();
      }
      const campaign = await Campaign.create({
        name: args.name, segmentId,
        message: args.message, channel: args.channel || 'email'
      });
      return { campaignId: campaign._id.toString(), name: campaign.name };
    }

    case 'send_campaign': {
      // FIX: Validate campaignId is a real ObjectId before querying
      const isValidCampaignId = /^[a-f\d]{24}$/i.test(args.campaignId);
      if (!isValidCampaignId) return { error: `Invalid campaignId "${args.campaignId}". Use the campaignId returned by create_campaign.` };
      const campaign = await Campaign.findById(args.campaignId);
      if (!campaign) return { error: 'Campaign not found' };

      const segment   = await Segment.findById(campaign.segmentId);
      if (!segment) return { error: 'Segment not found for this campaign' };

      const customers = await getAudienceForSegment(segment);

      campaign.status      = 'sending';
      campaign.stats.total = customers.length;
      campaign.stats.sent  = customers.length;
      await campaign.save();

      const logs = customers.map(c => ({
        campaignId: campaign._id, customerId: c._id, customerEmail: c.email,
        message: campaign.message.replace(/\{\{name\}\}/g, c.name).replace(/\{\{city\}\}/g, c.city),
        channel: campaign.channel, status: 'sent',
        statusHistory: [{ status: 'sent', timestamp: new Date() }]
      }));

      const savedLogs = await CommunicationLog.insertMany(logs);
      const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:5001';
      const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:5000/api/webhook/delivery';

      savedLogs.forEach(log => {
        axios.post(`${CHANNEL_SERVICE_URL}/send`, {
          logId: log._id, campaignId: campaign._id,
          recipient: log.customerEmail, message: log.message,
          channel: campaign.channel, callbackUrl: CALLBACK_URL
        }).catch(err => console.error('[Agent] Channel service error:', err.message));
      });

      return { success: true, recipients: customers.length, message: `Campaign sent to ${customers.length} customers! Delivery updates will arrive over the next 30 seconds.` };
    }

    case 'get_campaign_stats': {
      const isValidStatId = /^[a-f\d]{24}$/i.test(args.campaignId);
      if (!isValidStatId) return { error: `Invalid campaignId "${args.campaignId}". Use the campaignId returned by create_campaign.` };
      const campaign = await Campaign.findById(args.campaignId).populate('segmentId', 'name');
      if (!campaign) return { error: 'Campaign not found' };
      const deliveryRate = campaign.stats.sent > 0 ? ((campaign.stats.delivered / campaign.stats.sent) * 100).toFixed(1) : 0;
      const openRate = campaign.stats.delivered > 0 ? ((campaign.stats.opened / campaign.stats.delivered) * 100).toFixed(1) : 0;
      return { name: campaign.name, status: campaign.status, stats: campaign.stats, deliveryRate: `${deliveryRate}%`, openRate: `${openRate}%` };
    }

    case 'list_campaigns': {
      const campaigns = await Campaign.find().populate('segmentId', 'name').sort({ createdAt: -1 }).limit(10);
      return campaigns.map(c => ({ id: c._id.toString(), name: c.name, status: c.status, stats: c.stats, segment: c.segmentId?.name }));
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ── GEMINI handler ───────────────────────────────────────────────────────────
async function runGemini(messages) {
  // FIX: Use gemini-2.0-flash (gemini-1.5-flash is deprecated/unreliable)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
    tools: geminiTools
  });

  // FIX: Properly build history - must start with a 'user' turn for Gemini
  // messages from frontend arrive with role 'user' or 'assistant'
  const allHistory = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
  }));

  // Gemini requires history to start with 'user' role - skip leading model messages
  const firstUserIdx = allHistory.findIndex(m => m.role === 'user');
  const history = firstUserIdx === -1 ? [] : allHistory.slice(firstUserIdx);

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1];

  let response = await chat.sendMessage(lastMessage.content);
  const toolsUsed = [];
  let loopCount = 0;

  while (loopCount < 6) {
    loopCount++;
    const candidate = response.response.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const functionCalls = parts.filter(p => p.functionCall);
    if (functionCalls.length === 0) break;

    const toolResults = [];
    for (const part of functionCalls) {
      const { name, args } = part.functionCall;
      console.log(`[Gemini] Tool: ${name}`, args);
      toolsUsed.push(name);
      const result = await executeTool(name, args);
      toolResults.push({ functionResponse: { name, response: result } });
    }
    response = await chat.sendMessage(toolResults);
  }

  let finalText;
  try { finalText = response.response.text(); }
  catch {
    finalText = `✅ Done! Completed: ${toolsUsed.join(', ')}.\n\nCheck the **Campaigns** page for live delivery stats!`;
  }

  return { reply: finalText, toolsUsed };
}

// ── GROQ handler (fallback) ──────────────────────────────────────────────────
async function runGroq(messages) {
  const groqMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map(m => ({
      role: m.role === 'ai' ? 'assistant' : m.role,
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
    }))
  ];

  const toolsUsed = [];
  // FIX: Track real IDs returned by tools so we can override hallucinated ones
  const realIds = { segmentId: null, campaignId: null };

  let loopCount = 0;

  while (loopCount < 10) {
    loopCount++;

    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        tools: groqTools,
        tool_choice: 'auto',
        max_tokens: 1024
      });
    } catch (groqErr) {
      // FIX: Groq sometimes emits malformed tool call XML — on tool_use_failed,
      // strip the last assistant message and ask it to continue in plain text
      if (groqErr?.error?.error?.code === 'tool_use_failed') {
        console.warn('[Groq] Malformed tool call, retrying without tools...');
        const lastAssistant = [...groqMessages].reverse().find(m => m.role === 'assistant');
        if (lastAssistant) groqMessages.splice(groqMessages.lastIndexOf(lastAssistant), 1);
        // One plain-text retry
        const fallback = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: groqMessages,
          max_tokens: 512
        });
        const fallbackMsg = fallback.choices[0].message;
        return { reply: fallbackMsg.content || `✅ Done! Completed: ${toolsUsed.join(', ')}.\n\nCheck the **Campaigns** page for live delivery stats!`, toolsUsed };
      }
      throw groqErr;
    }

    const msg = completion.choices[0].message;
    groqMessages.push(msg);

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return { reply: msg.content || `✅ Done! Completed: ${toolsUsed.join(', ')}.\n\nCheck the **Campaigns** page for live delivery stats!`, toolsUsed };
    }

    for (const call of msg.tool_calls) {
      const name = call.function.name;
      let args;
      try {
        args = JSON.parse(call.function.arguments || '{}');
      } catch {
        console.warn(`[Groq] Failed to parse args for ${name}, skipping`);
        groqMessages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify({ error: 'Invalid arguments JSON' }) });
        continue;
      }

      // FIX: Override hallucinated IDs with the real ones we captured from previous tool results
      if (name === 'create_campaign' && realIds.segmentId) {
        const isValidOid = /^[a-f\d]{24}$/i.test(args.segmentId);
        if (!isValidOid) {
          console.warn(`[Groq] Overriding hallucinated segmentId "${args.segmentId}" with real "${realIds.segmentId}"`);
          args.segmentId = realIds.segmentId;
        }
      }
      if (name === 'send_campaign' && realIds.campaignId) {
        const isValidOid = /^[a-f\d]{24}$/i.test(args.campaignId);
        if (!isValidOid) {
          console.warn(`[Groq] Overriding hallucinated campaignId "${args.campaignId}" with real "${realIds.campaignId}"`);
          args.campaignId = realIds.campaignId;
        }
      }
      if (name === 'get_campaign_stats' && realIds.campaignId) {
        const isValidOid = /^[a-f\d]{24}$/i.test(args.campaignId);
        if (!isValidOid) {
          args.campaignId = realIds.campaignId;
        }
      }

      console.log(`[Groq] Tool: ${name}`, args);
      toolsUsed.push(name);
      const result = await executeTool(name, args);

      // FIX: Capture real IDs as soon as tools return them
      if (result.segmentId) realIds.segmentId = result.segmentId;
      if (result.campaignId) realIds.campaignId = result.campaignId;

      groqMessages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result)
      });
    }
  }

  return { reply: `✅ Done! Completed: ${toolsUsed.join(', ')}.\n\nCheck the **Campaigns** page for live delivery stats!`, toolsUsed };
}

// ── Chat endpoint with fallback ──────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // FIX: Validate that messages array is present and not empty
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    let result;
    let provider = 'gemini';

    try {
      result = await runGemini(messages);
    } catch (geminiErr) {
      console.warn('[Agent] Gemini failed, falling back to Groq:', geminiErr.message);
      provider = 'groq';
      result = await runGroq(messages);
    }

    res.json({ reply: result.reply, toolsUsed: result.toolsUsed, role: 'assistant', provider });
  } catch (e) {
    console.error('Agent error (both providers failed):', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;