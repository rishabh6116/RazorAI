# RazorAI — AI-Powered Agentic Commerce Assistant

**Razorpay AI Builder Internship 2026 · Track 1: AI Growth & Agentic Commerce**

RazorAI is a full-stack, production-quality e-commerce web app where an AI **agent** — not a scripted
chatbot — understands what a customer wants, searches a real product catalog, recommends the best
match, proactively upsells and cross-sells, builds the cart, and takes the customer through a secure
Razorpay checkout. A merchant dashboard measures exactly how much of that revenue the AI generated.

---

## 1. Project Overview

Online merchants lose revenue in two places: customers who don't find the right product fast enough,
and missed opportunities to attach complementary items to a sale. RazorAI closes both gaps with a
single conversational agent backed by real tools, real inventory, and a real payment flow.

## 2. Problem Statement

- Customers on a typical e-commerce site have to manually filter, compare, and research products.
- Merchants have no easy way to systematically upsell/cross-sell at the point of decision.
- Most "AI shopping assistants" are just chat wrappers around an LLM with no real actions or backend
  integration, so they can't actually add items to a cart or take a payment.

## 3. Solution

RazorAI implements a genuine **agent workflow**: the LLM (Gemini) is given a set of callable tools
backed by MongoDB and Razorpay. The agent decides which tools to call based on the conversation,
executes them against real data, and only ever talks about products/prices that actually exist in
the database. This turns "chat" into "commerce."

## 4. Features

- Natural-language requirement understanding (category, budget, use case)
- Real-time product search & filtering against MongoDB
- AI-generated "best match" recommendation with a stated reason
- Automatic upsell suggestions (higher tier, same category)
- Automatic cross-sell suggestions (complementary categories, e.g. laptop → mouse/bag/stand)
- Conversational cart management (add/remove/update via chat or UI)
- Full manual shop with search, category, and price filters
- Secure Razorpay checkout (test mode) with server-side signature verification
- Merchant Growth Dashboard: revenue, AOV, upsell/cross-sell revenue, AI conversion rate, charts
- "AI Revenue Insights" — auto-generated, data-driven growth observations
- Toast notifications, typing indicator, cart drawer, responsive UI throughout

## 5. Agent Architecture

```
User message
   │
   ▼
POST /api/ai/chat  (rate-limited)
   │
   ▼
geminiService.runAgent()
   │  - loads conversation history from MongoDB
   │  - sends message + history + tool schemas to Gemini (gemini-2.0-flash)
   │
   ▼
Gemini decides: respond directly, OR call one or more tools
   │
   ▼ (if tool call requested)
agentTools.js executes the real function against MongoDB / Razorpay:
   searchProducts · getProductDetails · recommendProducts · analyzeCart
   suggestUpsell · suggestCrossSell · addToCart · removeFromCart · createRazorpayOrder
   │
   ▼
Tool result fed back to Gemini → loop continues (max 6 turns) until Gemini
produces a final natural-language answer grounded in real tool output
   │
   ▼
Response + executed tool calls saved to Conversation, returned to frontend
   │
   ▼
Frontend (ChatMessage.jsx) extracts real product objects from the tool-call
results and renders them as product cards — the AI can never show a
hallucinated product because the UI only renders what the tools returned.
```

This is what makes it "agentic" rather than a chatbot: the model's job is to **decide which function
to call and with what arguments**, not to generate product data from its own knowledge.

## 6. Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Recharts, react-hot-toast
**Backend:** Node.js, Express.js, MongoDB + Mongoose, express-rate-limit
**AI:** Google Gemini API (`@google/generative-ai`, model `gemini-2.0-flash`) with native function calling
**Payments:** Razorpay Node SDK + Razorpay Checkout.js (test/sandbox mode)

## 7. System Architecture

```
┌────────────────┐      REST/JSON      ┌─────────────────┐
│  React (Vite)  │ ◄─────────────────► │  Express API     │
│  client:5173   │                     │  server:5000     │
└────────────────┘                     └────────┬─────────┘
        │                                        │
        │ Razorpay Checkout.js (client)          ├── MongoDB (products, cart, orders,
        ▼                                        │   conversations, recommendations)
┌────────────────┐                                ├── Gemini API (agent reasoning + tool calls)
│ Razorpay Modal │ ── payment ──► verify() ───────┴── Razorpay API (order creation, capture)
└────────────────┘
```

## 8. Database Schema

| Model | Key Fields |
|---|---|
| **User** | name, email, sessionId |
| **Product** | name, category, price, rating, image, specs, tags, complementaryCategories, stock |
| **Cart** | sessionId, items[{ product, quantity, priceAtAdd, source }] |
| **Order** | sessionId, items[], subtotal, aiRecommendedRevenue, upsellRevenue, crossSellRevenue, total, razorpayOrderId, razorpayPaymentId, razorpaySignature, status |
| **Conversation** | sessionId, messages[{ role, content, toolCalls }], extractedIntent |
| **Recommendation** | sessionId, product, type (primary/upsell/cross_sell), accepted, convertedToOrder, revenue |

`source` / `type` fields (`manual`, `ai_recommendation`, `upsell`, `cross_sell`) are what let the
dashboard attribute revenue specifically to AI actions.

## 9. API Documentation

### Products
- `GET /api/products?category=&maxPrice=&minPrice=&search=&sort=` — list/filter products
- `GET /api/products/categories` — distinct category list
- `GET /api/products/:id` — single product

### Cart
- `GET /api/cart/:sessionId`
- `POST /api/cart/:sessionId/items` `{ productId, quantity, source }`
- `PATCH /api/cart/:sessionId/items/:productId` `{ quantity }`
- `DELETE /api/cart/:sessionId/items/:productId`
- `DELETE /api/cart/:sessionId` — clear cart

### AI Agent
- `POST /api/ai/chat` `{ sessionId, message }` → `{ reply, toolCalls }`
- `GET /api/ai/history/:sessionId`
- `DELETE /api/ai/history/:sessionId` — reset conversation

### Payments
- `POST /api/payment/create-order` `{ sessionId }` → creates a Razorpay order for the **server-computed**
  cart total; returns `{ razorpayOrder, keyId, amount, currency }`
- `POST /api/payment/verify` `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` → verifies
  HMAC SHA256 signature server-side, marks order `paid`, clears cart
- `GET /api/payment/order/:id`

### Dashboard
- `GET /api/dashboard/summary` — orders, revenue, AOV, products sold, AI/upsell/cross-sell revenue,
  conversion rate, 14-day revenue chart, top products, recent orders
- `GET /api/dashboard/insights` — auto-generated natural-language growth insights

## 10. Setup Instructions

**Prerequisites:** Node.js 18+, a running MongoDB instance (local or Atlas), a Gemini API key, and
Razorpay **test mode** API keys.

```bash
# 1. Clone / unzip the project, then from the project root:
npm run install:all       # installs both server and client dependencies

# 2. Configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# edit server/.env and fill in MONGODB_URI, GEMINI_API_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

# 3. Seed the product catalog (33 products across 9 categories)
npm run seed

# 4. Run both frontend and backend together
npm run dev
```

Frontend: http://localhost:5173  ·  Backend: http://localhost:5000

Or run them separately:
```bash
npm run server   # backend only, http://localhost:5000
npm run client   # frontend only, http://localhost:5173
```

## 11. Environment Variables

`server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/razorai
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
CLIENT_URL=http://localhost:5173
```

`client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Secrets are **never** hardcoded and never sent to the frontend — only the public `RAZORPAY_KEY_ID` is
exposed to the client (this is safe and standard practice; the secret key stays server-side).

## 12. Razorpay Integration

1. Frontend calls `POST /api/payment/create-order` with the session ID only (no amount!).
2. Backend recomputes the cart total from MongoDB, creates a Razorpay order via the Node SDK, and
   stores a `created` Order record with that server-computed total.
3. Frontend opens Razorpay Checkout.js using the returned `order_id` and public key.
4. On success, Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` to the
   browser — these are **not** trusted on their own.
5. Frontend sends all three to `POST /api/payment/verify`. The backend recomputes an HMAC SHA256 of
   `order_id|payment_id` using the Razorpay secret and compares it to the given signature. Only if
   they match is the order marked `paid` — this is the single source of truth for payment success.
6. Use Razorpay's official test card: `4111 1111 1111 1111`, any future expiry, any CVV.

## 13. Gemini Integration

- Uses `@google/generative-ai` with the `gemini-2.0-flash` model.
- Tool schemas are declared with `SchemaType` and passed via `tools: [{ functionDeclarations }]`.
- A detailed system instruction tells the model to ground every answer in tool output and to always
  offer upsell/cross-sell after a primary recommendation.
- `geminiService.runAgent()` implements the full function-calling loop: send message → check
  `response.functionCalls()` → execute real tools → send `functionResponse` parts back → repeat (max 6
  iterations) → return final text.

## 14. Screenshots

_Add screenshots here after running the app locally:_
- Landing page
- AI Shopping Assistant conversation with recommended products
- Cart drawer
- Checkout with Razorpay modal open
- Order success page
- Merchant dashboard with charts

## 15. Future Improvements

- Multi-turn intent memory across sessions (persist extracted budget/category to skip re-asking)
- Streaming AI responses token-by-token instead of waiting for the full reply
- Real user accounts/auth instead of anonymous session IDs
- Admin CRUD UI for managing products instead of only the seed script
- A/B testing framework to measure recommendation strategies against each other
- Webhook-based Razorpay payment confirmation as a fallback to client-side verification

## 16. What to Demonstrate in the 5-Minute Pitch Video

1. **(30s)** Problem statement: manual shopping + missed upsell opportunities
2. **(60s)** Live demo: type "I need a laptop for coding under ₹60,000" in the AI Assistant — show it
   searching, recommending a specific product with a reason, and suggesting a mouse + stand
3. **(45s)** Click "Add Recommended Items" → show the cart updating with AI-sourced items tagged
4. **(60s)** Go to Checkout → complete a real Razorpay test-mode payment → land on the verified
   success page
5. **(60s)** Open the Merchant Dashboard → point out AI-driven revenue, upsell/cross-sell revenue,
   conversion rate, and the auto-generated "AI Revenue Insights" section
6. **(15s)** Close on the agent architecture diagram — emphasize this is a genuine tool-calling agent,
   not a scripted chatbot
