# ⚡ XenoAI — *Where Intelligence Meets Every Customer*
<table>
  <tr>
    <td>
      <img src="https://github.com/user-attachments/assets/b2c358b9-1c04-4e5a-8e2e-43afefa7fae4" width="100%">
    </td>
    <td>
      <img src="https://github.com/user-attachments/assets/1cfb2653-7f43-45da-8f3d-3e05aec1cf0f" width="100%">
    </td>
  </tr>
</table>



> 🚀 An AI-native Mini CRM that lets you **talk to your data, segment your audience, and launch campaigns** — all from a single chat interface.

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-crm--ew6l.vercel.app-6366f1?style=for-the-badge)](https://crm-ew6l.vercel.app)
[![Backend](https://img.shields.io/badge/🖥️%20Backend-Render-22c55e?style=for-the-badge)](https://xeno-crm-backend-lo8a.onrender.com/health)
[![Channel Service](https://img.shields.io/badge/📡%20Channel%20Service-Render-f59e0b?style=for-the-badge)](https://xeno-channel-service-9590.onrender.com/health)

<br/>

---

## 📌 Table of Contents

- [✨ About the Project](#-about-the-project)
- [🎯 Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🤖 AI Agent — XenoAI](#-ai-agent--xenoai)
- [📁 Project Structure](#-project-structure)
- [⚙️ Environment Variables](#️-environment-variables)
- [🚀 Getting Started](#-getting-started)
- [🔗 API Reference](#-api-reference)
- [📸 Demo Credentials](#-demo-credentials)
- [🌐 Deployment](#-deployment)
- [👨‍💻 Author](#-author)

---

## ✨ About the Project

**XenoAI** is a **chat-first, AI-native CRM** built for D2C brands. Instead of clicking through dashboards and form builders, you simply *talk* to the AI agent — describe who you want to reach, and XenoAI handles everything: segmenting your audience, writing the message, launching the campaign, and reporting back the stats.

Built as part of the **Xeno Engineering Assignment**, this project demonstrates a production-grade multi-service architecture with real-time delivery simulation, AI function-calling, and a polished React frontend.

---

## 🎯 Key Features

### 🧠 AI Campaign Agent
- Chat with an intelligent agent powered by **Gemini 1.5 Flash** (with **Groq/LLaMA 3.3 70B** as fallback)
- Describe your audience in plain English — the agent creates segments, writes messages, and launches campaigns automatically
- Full **function-calling / tool-use** loop: preview segment → create segment → write message → create campaign → send → report stats

### 👥 Customer Management
- Full CRUD for customer records
- Fields: name, email, city, total spend, visit count, last active date, tags
- CSV bulk import via **PapaParse**
- Powerful server-side filtering and search

### 🎯 Audience Segmentation
- Visual rule builder with fields: `totalSpend`, `visitCount`, `lastActiveDate`, `city`, `tags`
- Operators: `gt`, `lt`, `gte`, `lte`, `eq`, `contains`, `in_last_days`, `not_in_last_days`, `in`
- `AND` / `OR` logic operator support
- Live audience preview count before saving

### 📣 Campaign Execution
- Create campaigns targeting any saved segment
- Channels: **Email**, **SMS**, **WhatsApp**
- Personalization tokens: `{{name}}`, `{{city}}`
- Real-time delivery stats: sent → delivered → opened → clicked
- Full communication log per campaign

### 📡 Channel Service (Microservice)
- Separate Express microservice simulating real message delivery
- Async webhook callbacks update delivery status in real time
- Realistic open rate (~45%) and click rate (~20%) simulation

### 📊 Analytics Dashboard
- Campaign performance overview
- Delivery funnel: Sent → Delivered → Opened → Clicked
- Customer stats: total, high-value (spend > ₹10,000), at-risk

### 🔐 Authentication
- JWT-based auth with 7-day token expiry
- Secure password hashing with **bcryptjs**
- Session restore on refresh via `/api/auth/me`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│              React 19 + React Router v7                     │
│         Vercel → https://crm-ew6l.vercel.app                │
└────────────────────────┬────────────────────────────────────┘
                         │ REST / JSON
          ┌──────────────▼──────────────┐
          │        CRM BACKEND           │
          │    Node.js + Express 5       │
          │  Render → xeno-crm-backend   │
          │                              │
          │  Routes: auth, customers,    │
          │  orders, segments,           │
          │  campaigns, analytics,       │
          │  agent (AI), webhook         │
          └──────────┬──────────────────┘
                     │                   │
          ┌──────────▼──────┐   ┌────────▼────────┐
          │    MongoDB       │   │  Channel Service │
          │   Atlas (Cloud)  │   │  Express micro-  │
          │                  │   │  service on Render│
          │  Collections:    │   │                  │
          │  users           │   │  Simulates:      │
          │  customers       │   │  delivered       │
          │  segments        │   │  opened          │
          │  campaigns       │   │  clicked         │
          │  orders          │   │  → webhook back  │
          │  communicationlogs│  └──────────────────┘
          └──────────────────┘
                     │
          ┌──────────▼──────────────┐
          │      AI LAYER            │
          │  Gemini 1.5 Flash (primary)│
          │  Groq LLaMA 3.3 70B (fallback)│
          │  8 tool functions        │
          └──────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router v7, Framer Motion, Recharts, Lucide React |
| **Styling** | Custom CSS with CSS variables (dark/light theme) |
| **HTTP Client** | Axios + native fetch with timeout |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | JSON Web Tokens (JWT) + bcryptjs |
| **AI (Primary)** | Google Gemini 1.5 Flash |
| **AI (Fallback)** | Groq — LLaMA 3.3 70B Versatile |
| **Channel Service** | Express microservice (separate Render instance) |
| **CSV Parsing** | PapaParse |
| **Data Viz** | Recharts |
| **Deployment** | Vercel (frontend) + Render (backend + channel service) |

---

## 🤖 AI Agent — XenoAI

The heart of the product. XenoAI is an AI agent with **8 callable tools** that it chains together autonomously to complete your marketing request end-to-end.

### 🔧 Available Tools

| Tool | Description |
|---|---|
| `get_customer_stats` | Total customers, high-value count, at-risk count, top cities |
| `preview_segment` | How many customers match given rules (before saving) |
| `create_segment` | Save an audience segment with filtering rules |
| `list_segments` | List all saved segments |
| `create_campaign` | Create a campaign for a segment with a message |
| `send_campaign` | Launch the campaign and dispatch to Channel Service |
| `get_campaign_stats` | Delivery stats for a specific campaign |
| `list_campaigns` | List all campaigns with stats |

### 💬 Example Prompts

```
"Target customers in Mumbai who haven't shopped in 90 days and send them a win-back offer"

"Show me stats for high-value customers who spent more than ₹10,000"

"Create a WhatsApp campaign for customers tagged as VIP in Pune and Delhi"

"What's the delivery performance of my last campaign?"
```

### 🔄 Fallback Strategy
- **Primary**: Gemini 1.5 Flash (Google AI)
- **Fallback**: Groq with LLaMA 3.3 70B (activates automatically if Gemini fails)
- Tool loop runs up to **6 iterations** (Gemini) / **10 iterations** (Groq) to complete complex multi-step tasks

---

## 📁 Project Structure

```
XenoAI/
│
├── 📂 frontend/                    # React app (deployed on Vercel)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios instance with JWT interceptor
│   │   ├── context/
│   │   │   ├── AuthContext.js      # Auth state, login/signup/logout
│   │   │   └── ThemeContext.js     # Dark/light theme toggle
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Public landing page
│   │   │   ├── Login.jsx           # Auth page (login + signup tabs)
│   │   │   ├── Dashboard.jsx       # Analytics overview
│   │   │   ├── Customers.jsx       # Customer list + CSV import
│   │   │   ├── Segments.jsx        # Segment rule builder
│   │   │   ├── Campaigns.jsx       # Campaign management
│   │   │   ├── Agent.jsx           # AI chat interface
│   │   │   └── Ingest.jsx          # Data ingestion
│   │   ├── components/
│   │   │   └── Sidebar.jsx         # Navigation sidebar
│   │   └── App.jsx                 # Router + layout
│   └── package.json
│
├── 📂 crm-backend/                 # Main backend (deployed on Render)
│   └── src/
│       ├── app.js                  # Express app, CORS, routes
│       ├── models/
│       │   ├── User.js             # Auth model (bcrypt hashing)
│       │   ├── Customer.js         # Customer schema
│       │   ├── Segment.js          # Segment + rules schema
│       │   ├── Campaign.js         # Campaign + stats schema
│       │   ├── Order.js            # Order schema
│       │   └── CommunicationLog.js # Per-message delivery log
│       ├── routes/
│       │   ├── auth.js             # POST /signup, /login, GET /me
│       │   ├── customers.js        # CRUD + search
│       │   ├── segments.js         # CRUD + preview
│       │   ├── campaigns.js        # CRUD + send
│       │   ├── agent.js            # AI agent chat endpoint
│       │   ├── analytics.js        # Dashboard stats
│       │   ├── orders.js           # Order routes
│       │   └── webhook.js          # Delivery status callback
│       ├── middleware/
│       │   └── auth.js             # JWT verification middleware
│       └── services/
│           └── segmentService.js   # Audience query builder
│
├── 📂 channel-service/             # Delivery simulation (deployed on Render)
│   └── index.js                    # POST /send → simulate delivery → webhook
│
└── render.yaml                     # Render deployment config
```

---

## ⚙️ Environment Variables

### `crm-backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/xenocrm
JWT_SECRET=your_super_secret_jwt_key

GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key

CHANNEL_SERVICE_URL=https://xeno-channel-service-9590.onrender.com
CALLBACK_URL=https://xeno-crm-backend-lo8a.onrender.com/api/webhook/delivery
```

### `frontend/.env`

```env
REACT_APP_API_URL=https://xeno-crm-backend-lo8a.onrender.com/api
```

> ⚠️ **Important:** React env vars are baked at build time. After updating `.env` on Vercel, always trigger a **Redeploy**.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (free tier works)
- Google Gemini API key → [aistudio.google.com](https://aistudio.google.com)
- Groq API key → [console.groq.com](https://console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/xenoai-crm.git
cd xenoai-crm
```

### 2. Start the backend

```bash
cd crm-backend
npm install
cp .env.example .env   # fill in your values
npm start
# 🚀 Running on http://localhost:5000
```

### 3. Start the channel service

```bash
cd channel-service
npm install
npm start
# 📡 Running on http://localhost:5001
```

### 4. Start the frontend

```bash
cd frontend
npm install
# Create .env and set REACT_APP_API_URL=http://localhost:5000/api
npm start
# 🌐 Opens on http://localhost:3000
```

---

## 🔗 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/auth/me` | Get current user (🔒 JWT) |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers` | List customers (filter/search) |
| `POST` | `/api/customers` | Create customer |
| `PUT` | `/api/customers/:id` | Update customer |
| `DELETE` | `/api/customers/:id` | Delete customer |

### Segments
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/segments` | List segments |
| `POST` | `/api/segments` | Create segment |
| `POST` | `/api/segments/preview` | Preview audience size |
| `DELETE` | `/api/segments/:id` | Delete segment |

### Campaigns
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/campaigns` | List campaigns |
| `POST` | `/api/campaigns` | Create campaign |
| `POST` | `/api/campaigns/:id/send` | Launch campaign |
| `GET` | `/api/campaigns/:id/logs` | Get delivery logs |

### AI Agent
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/agent/chat` | Send message to XenoAI |

### Webhook
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/webhook/delivery` | Delivery status callback from channel service |

---

## 📸 Demo Credentials

```
📧 Email:    admin@trendvault.com
🔑 Password: admin123
```

> Or click **"Use demo account"** on the login page for auto-fill, or **"Continue with Google demo"** for instant access.

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://crm-ew6l.vercel.app |
| CRM Backend | Render (free) | https://xeno-crm-backend-lo8a.onrender.com |
| Channel Service | Render (free) | https://xeno-channel-service-9590.onrender.com |
| Database | MongoDB Atlas | Cloud (M0 free tier) |

> 💡 **Note:** Render free tier services spin down after 15 minutes of inactivity. The first request after a cold start may take ~30 seconds. The app handles this gracefully with a 45-second timeout and a warm-up ping on load.

---

## 👨‍💻 Author

**Anshul** — B.Tech CSE-DS, ABES Engineering College

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/your-username)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/your-profile)

---

<div align="center">

**Built with ❤️ for the Xeno Engineering Assignment**

*XenoAI — Where Intelligence Meets Every Customer*

</div>