// // ---------------- IMPORTS ----------------
// import express from "express";
// import dotenv from "dotenv";
// import path from "path";
// import cookieParser from "cookie-parser";
// import crypto from "crypto";
// import { DynamicStructuredTool } from "@langchain/core/tools";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { z } from "zod";
// import multer from "multer";
// import fs from "fs";

// // Fix pdf-parse import for ESM
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const pdfParse = require("pdf-parse");

// // ---------------- ENV ----------------
// dotenv.config();
// const PORT = process.env.PORT || 3000;

// // ---------------- EXPRESS APP ----------------
// const app = express();
// app.use(express.json());
// app.use(express.static(path.join(process.cwd(), "public")));
// app.use(cookieParser());

// // ---------------- MEMORY STORE ----------------
// const MemoryStore = new Map();
// app.use((req, res, next) => {
//   let sid = req.cookies.sid;
//   if (!sid) {
//     sid = crypto.randomBytes(16).toString("hex");
//     res.cookie("sid", sid, { httpOnly: true });
//   }
//   if (!MemoryStore.has(sid)) MemoryStore.set(sid, { preferences: {}, history: [] });
//   req.memory = MemoryStore.get(sid);
//   req.sid = sid;
//   next();
// });

// // ---------------- TOOLS ----------------
// const getMenuTool = new DynamicStructuredTool({
//   name: "getMenuTool",
//   description: "Get today's menu for breakfast/lunch/dinner",
//   schema: z.object({ category: z.string() }),
//   func: async ({ category }) => {
//     const menus = {
//       breakfast: "Aloo Paratha, Poha, Masala Chai, Dosa",
//       lunch: "Paneer Butter Masala, Dal Tadka, Veg Biryani, Roti",
//       dinner: "Raita, Roti, Rice, Gulab Jamun",
//     };
//     return menus[category.toLowerCase()] || "No menu found for that category.";
//   },
// });

// const calculatorTool = new DynamicStructuredTool({
//   name: "calculatorTool",
//   description: "Calculate math expressions",
//   schema: z.object({ expression: z.string() }),
//   func: async ({ expression }) => {
//     try {
//       if (!/^[0-9+\-*/().\s]+$/.test(expression)) return "Invalid characters.";
//       return String(Function(`"use strict"; return (${expression})`)());
//     } catch {
//       return "Error evaluating expression.";
//     }
//   },
// });

// // ---------------- PROMPT TEMPLATE ----------------
// const prompt = ChatPromptTemplate.fromMessages([
//   ["system", "You are a helpful restaurant assistant."],
//   ["system", "User preferences: {preferences}"],
//   ["human", "{input}"],
// ]);

// // ---------------- PDF / RAG ----------------
// const upload = multer({ dest: "uploads/" });
// const docsStore = new Map();

// app.post("/api/upload", upload.single("file"), async (req, res) => {
//   try {
//     const buffer = fs.readFileSync(req.file.path);
//     const data = await pdfParse(buffer);
//     const paragraphs = data.text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
//     docsStore.set(req.sid, paragraphs);
//     fs.unlinkSync(req.file.path);
//     res.json({ ok: true, paragraphsCount: paragraphs.length });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ ok: false, error: String(err) });
//   }
// });

// function searchDocsForQuery(sid, query) {
//   const paras = docsStore.get(sid) || [];
//   return paras.filter(p => p.toLowerCase().includes(query.toLowerCase())).slice(0, 4).join("\n\n");
// }

// // ---------------- CHAT ROUTE ----------------
// app.post("/api/chat", async (req, res) => {
//   try {
//     const userInput = req.body.message;

//     // MEMORY
//     if (/veg/i.test(userInput) || /vegetarian/i.test(userInput)) {
//       req.memory.preferences.diet = "vegetarian";
//     }
//     req.memory.history.push({ role: "user", text: userInput });

//     const docContext = searchDocsForQuery(req.sid, userInput);
//     const combinedInput = docContext
//       ? `Context from documents:\n${docContext}\n\nUser: ${userInput}`
//       : userInput;

//     let result;
//     if (/menu/i.test(userInput)) {
//       const categoryMatch = userInput.match(/breakfast|lunch|dinner/i);
//       const category = categoryMatch ? categoryMatch[0] : "lunch";
//       result = await getMenuTool.invoke({ category });
//     } else if (/^[0-9+\-*/().\s]+$/.test(userInput)) {
//       result = await calculatorTool.invoke({ expression: userInput });
//     } else {
//       result = `You said: ${userInput}`;
//     }

//     req.memory.history.push({ role: "assistant", text: result });
//     res.json({ reply: result });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: String(err) });
//   }
// });

// // ---------------- ADMIN DASHBOARD ----------------
// app.get("/api/admin/stats", (req, res) => {
//   res.json({
//     activeSessions: MemoryStore.size,
//     totalDocsUploaded: Array.from(docsStore.values()).reduce((a, b) => a + b.length, 0),
//   });
// });

// // ---------------- START SERVER ----------------
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));




import express from "express";
import dotenv from "dotenv";
import path from "path";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";

dotenv.config();

const app = express();
app.use(express.json());
const port = 3000;

// __dirname workaround for ES modules
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));


// ---------- MODEL ----------
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  maxOutputTokens: 2048,
  apiKey: process.env.GOOGLE_API_KEY, 
});


// ---------- TOOL ----------
const getMenuTool = new DynamicStructuredTool({
  name: "getMenuTool",
  description:
    "Use this to get today’s menu (breakfast, lunch, dinner).",
  schema: z.object({
    category: z.string(),
  }),
  func: async ({ category }) => {
    const menu = {
      breakfast: "Aloo Paratha, Poha, Tea, Idli, Dosa",
      lunch: "Paneer Butter, Dal Tadka, Rice, Roti, Veg Biryani",
      dinner: "Roti, Dal Fry, Jeera Rice, Salad, Dessert",
    };

    return menu[category.toLowerCase()] || "Menu not found.";
  },
});


// ---------- PROMPT ----------
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful AI assistant. Use tools if needed."],
  ["human", "{input}"],
]);


// ---------- AGENT (NEW WAY) ----------
const agent = RunnableSequence.from([
  prompt,
  model.bindTools([getMenuTool]),   // New Tool Binding API
]);


// ----------- ROUTES -------------

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/chat", async (req, res) => {
  const userInput = req.body.chat;

  try {
    const result = await agent.invoke({ input: userInput });
    const finalOutput = result.content[0].text;

    res.json({ output: finalOutput });
  } catch (err) {
    console.error("Agent Error:", err);
    res.status(500).json({ output: "Something went wrong." });
  }
});


// ---------- SERVER ----------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


