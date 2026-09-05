const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const tools = require('./agentTools');

const SYSTEM_INSTRUCTION = `You are RazorAI, an expert AI shopping assistant for an Indian e-commerce store selling
laptops, smartphones, accessories, headphones, keyboards, mice, monitors, laptop bags, and stands.

Your job is AGENTIC commerce, not just chatting:
1. Understand the customer's requirements (category, budget in INR, use case, must-have specs).
2. Call searchProducts / recommendProducts to find real matching products from the database. NEVER invent products or prices.
3. Recommend the single best product with a clear reason tied to their stated use case.
4. Proactively suggest upsell (a better version of the same product) and cross-sell (complementary
   accessories like a mouse, bag, or stand) using suggestUpsell / suggestCrossSell, based on the
   product the user is most interested in.
5. When the user agrees to add something, call addToCart. When they want something removed, call removeFromCart.
6. Use analyzeCart to check the current cart before answering questions about totals.
7. When the user wants to pay/checkout, call createRazorpayOrder.
8. Always ground your answer in actual tool results. If tools return no products, say so honestly and
   suggest loosening the budget or requirements.

Keep replies concise, friendly, and structured with short sentences. Prices are in INR (₹).
After recommending a product, always ask if they'd like the complementary items added.
Do not repeat the entire cart contents unless asked - summarize.`;

const toolDeclarations = [
  {
    name: 'searchProducts',
    description: 'Search the product catalog by category, price range, keywords, or tags.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        category: { type: SchemaType.STRING, description: 'Product category e.g. Laptops, Mice' },
        maxPrice: { type: SchemaType.NUMBER, description: 'Maximum price in INR' },
        minPrice: { type: SchemaType.NUMBER, description: 'Minimum price in INR' },
        keywords: { type: SchemaType.STRING, description: 'Free text search keywords' },
        tags: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Use-case tags like coding, gaming, budget, premium',
        },
        limit: { type: SchemaType.NUMBER },
      },
    },
  },
  {
    name: 'getProductDetails',
    description: 'Fetch full details of a single product by its ID.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { productId: { type: SchemaType.STRING } },
      required: ['productId'],
    },
  },
  {
    name: 'recommendProducts',
    description: 'Get the single best-recommended product for a category/budget/use case.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        category: { type: SchemaType.STRING },
        maxPrice: { type: SchemaType.NUMBER },
        useCase: { type: SchemaType.STRING },
        limit: { type: SchemaType.NUMBER },
      },
    },
  },
  {
    name: 'suggestUpsell',
    description: 'Suggest a higher-tier alternative to a given product (same category, higher price/rating).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { productId: { type: SchemaType.STRING } },
      required: ['productId'],
    },
  },
  {
    name: 'suggestCrossSell',
    description: 'Suggest complementary products for a given product (e.g. mouse/bag/stand for a laptop).',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { productId: { type: SchemaType.STRING } },
      required: ['productId'],
    },
  },
  {
    name: 'analyzeCart',
    description: "Get the current session's cart contents and subtotal.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: 'addToCart',
    description: 'Add a product to the cart for this session.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        productId: { type: SchemaType.STRING },
        quantity: { type: SchemaType.NUMBER },
        source: {
          type: SchemaType.STRING,
          description: 'One of manual, ai_recommendation, upsell, cross_sell',
        },
      },
      required: ['productId'],
    },
  },
  {
    name: 'removeFromCart',
    description: 'Remove a product from the cart for this session.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { productId: { type: SchemaType.STRING } },
      required: ['productId'],
    },
  },
  {
    name: 'createRazorpayOrder',
    description: "Create a Razorpay order for the session's current cart total, to begin checkout.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
];

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in server/.env');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: [{ functionDeclarations: toolDeclarations }],
  });
}

// Executes the named tool with sessionId injected automatically.
async function executeTool(name, args, sessionId) {
  const fn = tools[name];
  if (!fn) throw new Error(`Unknown tool requested by agent: ${name}`);
  return fn({ ...args, sessionId });
}

/**
 * Runs one turn of the agent loop:
 * - Sends the user's message + history to Gemini
 * - If Gemini requests tool calls, executes them against the real DB
 * - Feeds tool results back until Gemini produces a final text answer
 * - Caps iterations to avoid infinite loops
 *
 * NOTE: We build the `contents` array manually and call model.generateContent()
 * directly instead of using model.startChat()/chat.sendMessage(). The SDK's
 * chat wrapper hardcodes role "function" when sending tool results back, which
 * newer Gemini models (e.g. gemini-3.6-flash) reject with a 400 error. Managing
 * the array ourselves lets us send tool results as role "user" instead.
 */
async function runAgent({ message, history = [], sessionId }) {
  const model = getModel();

  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  const executedToolCalls = [];
  const MAX_TURNS = 6;
  let turns = 0;
  let result = await model.generateContent({ contents });

  while (turns < MAX_TURNS) {
    const functionCalls = result.response.functionCalls();
    if (!functionCalls || functionCalls.length === 0) break;

    // Push the model's own turn (its function-call request) back into history
    const modelContent = result.response.candidates[0].content;
    contents.push(modelContent);

    const responseParts = [];
    for (const call of functionCalls) {
      let toolResult;
      try {
        toolResult = await executeTool(call.name, call.args || {}, sessionId);
      } catch (err) {
        toolResult = { error: err.message };
      }
      executedToolCalls.push({ name: call.name, args: call.args, result: toolResult });
      responseParts.push({
        functionResponse: { name: call.name, response: toolResult },
      });
    }

    // Tool results go back as role "user" — NOT "function" (rejected by newer models)
    contents.push({ role: 'user', parts: responseParts });

    result = await model.generateContent({ contents });
    turns += 1;
  }

  const finalText = result.response.text();
  return { text: finalText, toolCalls: executedToolCalls };
}

module.exports = { runAgent, toolDeclarations };