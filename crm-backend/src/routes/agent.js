const router = require('express').Router();
const Anthropic = require('@anthropic-ai/sdk');
const Customer = require('../models/Customer');
const Segment = require('../models/Segment');
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');
const { previewSegment } = require('../services/segmentService');
const { getAudienceForSegment } = require('../services/segmentService');
const axios = require('axios');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const tools = [
  {
    name: "get_customer_stats",
    description: "Get overview stats about customers: total count, high-value customers, at-risk customers, city breakdown",
    input_schema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "preview_segment",
    description: "Preview how many customers match given rules before creating a segment. Always call this before create_segment.",
    input_schema: {
      type: "object",
      properties: {
        rules: {
          type: "array",
          description: "Array of rules. Each rule: { field, operator, value }. Fields: totalSpend, visitCount, lastActiveDate, city, tags. Operators: gt, lt, gte, lte, eq, not_in_last_days, in_last_days, contains, in",
          items: {
            type: "object",
            properties: {
              field: { type: "string" },
              operator: { type: "string" },
              value: {}
            }
          }
        },
        logicOperator: { type: "string", enum: ["AND", "OR"], description: "How to combine rules" }
      },
      required: ["rules"]
    }
  },
  {
    name: "create_segment",
    description: "Create an audience segment with rules",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        rules: { type: "array", items: { type: "object" } },
        logicOperator: { type: "string", enum: ["AND", "OR"] }
      },
      required: ["name", "rules"]
    }
  },
  {
    name: "list_segments",
    description: "List all existing audience segments",
    input_schema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "create_campaign",
    description: "Create a campaign for a segment with a personalized message",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        segmentId: { type: "string", description: "MongoDB ObjectId of the segment" },
        message: { type: "string", description: "Message text. Use {{name}} for customer name, {{city}} for city" },
        channel: { type: "string", enum: ["email", "sms", "whatsapp"] }
      },
      required: ["name", "segmentId", "message", "channel"]
    }
  },
  {
    name: "send_campaign",
    description: "Launch and send a campaign to its audience. Call after create_campaign.",
    input_schema: {
      type: "object",
      properties: {
        campaignId: { type: "string" }
      },
      required: ["campaignId"]
    }
  },
  {
    name: "get_campaign_stats",
    description: "Get delivery stats for a campaign: sent, delivered, failed, opened, clicked",
    input_schema: {
      type: "object",
      properties: {
        campaignId: { type: "string" }
      },
      required: ["campaignId"]
    }
  },
  {
    name: "list_campaigns",
    description: "List all campaigns with their stats",
    input_schema: { type: "object", properties: {}, required: [] }
  }
];

async function executeTool(toolName, toolInput) {
  switch (toolName) {
    case 'get_customer_stats': {
      const total = await Customer.countDocuments();
      const highValue = await Customer.countDocuments({ totalSpend: { $gt: 10000 } });
      const atRisk = await Customer.countDocuments({ lastActiveDate: { $lt: new Date(Date.now() - 90 * 86400000) } });
      const cityBreakdown = await Customer.aggregate([{ $group: { _id: '$city', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]);
      return { total, highValue, atRisk, topCities: cityBreakdown };
    }

    case 'preview_segment': {
      const result = await previewSegment(toolInput.rules, toolInput.logicOperator || 'AND');
      return result;
    }

    case 'create_segment': {
      const { count } = await previewSegment(toolInput.rules, toolInput.logicOperator || 'AND');
      const segment = await Segment.create({
        name: toolInput.name,
        description: toolInput.description,
        rules: toolInput.rules,
        logicOperator: toolInput.logicOperator || 'AND',
        audienceSize: count
      });
      return { segmentId: segment._id, name: segment.name, audienceSize: count };
    }

    case 'list_segments': {
      const segments = await Segment.find().sort({ createdAt: -1 }).limit(10);
      return segments.map(s => ({ id: s._id, name: s.name, audienceSize: s.audienceSize, rules: s.rules }));
    }

    case 'create_campaign': {
      const campaign = await Campaign.create({
        name: toolInput.name,
        segmentId: toolInput.segmentId,
        message: toolInput.message,
        channel: toolInput.channel || 'email'
      });
      return { campaignId: campaign._id, name: campaign.name };
    }

    case 'send_campaign': {
      const campaign = await Campaign.findById(toolInput.campaignId);
      if (!campaign) return { error: 'Campaign not found' };

      const segment = await Segment.findById(campaign.segmentId);
      const customers = await getAudienceForSegment(segment);

      campaign.status = 'sending';
      campaign.stats.total = customers.length;
      campaign.stats.sent = customers.length;
      await campaign.save();

      const CommunicationLog = require('../models/CommunicationLog');
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
        }).catch(() => {});
      });

      return { success: true, recipients: customers.length, message: `Campaign sent to ${customers.length} customers! Delivery updates will come in over the next 30 seconds.` };
    }

    case 'get_campaign_stats': {
      const campaign = await Campaign.findById(toolInput.campaignId).populate('segmentId', 'name');
      if (!campaign) return { error: 'Campaign not found' };
      const deliveryRate = campaign.stats.sent > 0 ? ((campaign.stats.delivered / campaign.stats.sent) * 100).toFixed(1) : 0;
      const openRate = campaign.stats.delivered > 0 ? ((campaign.stats.opened / campaign.stats.delivered) * 100).toFixed(1) : 0;
      return { name: campaign.name, status: campaign.status, stats: campaign.stats, deliveryRate: `${deliveryRate}%`, openRate: `${openRate}%` };
    }

    case 'list_campaigns': {
      const campaigns = await Campaign.find().populate('segmentId', 'name').sort({ createdAt: -1 }).limit(10);
      return campaigns.map(c => ({ id: c._id, name: c.name, status: c.status, stats: c.stats, segment: c.segmentId?.name }));
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

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

When a marketer describes what they want, you should:
1. First check customer stats or preview segments to understand the audience
2. Create the segment with well-defined rules
3. Craft a personalized message (use {{name}} and {{city}} for personalization)
4. Create and send the campaign
5. Confirm the action with key metrics

Be proactive — if someone says "win back inactive customers", figure out the right rules (e.g. lastActiveDate not in last 90 days), suggest a message, and execute it.

Always be specific about numbers: "This will reach 23 customers" is better than "some customers".
Keep messages short, friendly, and action-oriented for the brand.`;

    let currentMessages = messages.map(m => ({ role: m.role, content: m.content }));
    let response;

    // Agentic loop — keep going until no more tool calls
    while (true) {
      response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages: currentMessages
      });

      if (response.stop_reason === 'end_turn') break;

      if (response.stop_reason === 'tool_use') {
        const assistantMessage = { role: 'assistant', content: response.content };
        currentMessages.push(assistantMessage);

        const toolResults = [];
        for (const block of response.content) {
          if (block.type === 'tool_use') {
            console.log(`[Agent] Calling tool: ${block.name}`, block.input);
            const result = await executeTool(block.name, block.input);
            console.log(`[Agent] Tool result:`, result);
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(result)
            });
          }
        }

        currentMessages.push({ role: 'user', content: toolResults });
      } else {
        break;
      }
    }

    const textBlock = response.content.find(b => b.type === 'text');
    const toolCalls = response.content.filter(b => b.type === 'tool_use').map(b => b.name);

    res.json({
      reply: textBlock?.text || 'Done!',
      toolsUsed: toolCalls,
      role: 'assistant'
    });
  } catch (e) {
    console.error('Agent error:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;