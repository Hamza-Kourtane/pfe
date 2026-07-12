// Import Express
import express from "express";
import dotenv from "dotenv";

// Import Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Create a router
const router = express.Router();

// Create Gemini using the API key from .env
const geminiApiKey = process.env.GEMINI_API_KEY;
console.log("Gemini Key:", geminiApiKey ? "loaded" : "missing");
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

const getFallbackReply = (message) => {
  const text = message.toLowerCase();

  if (text.includes("pain") || text.includes("headache") || text.includes("fever") || text.includes("cough")) {
    return "I can help with general wellness advice, but I cannot diagnose you. If your symptoms are severe, sudden, or getting worse, please contact a doctor or visit urgent care.";
  }

  if (text.includes("medicine") || text.includes("medication")) {
    return "I can share general health guidance, but I cannot prescribe medication. Please speak with a licensed healthcare professional for treatment advice.";
  }

  return "Thanks for sharing that. I’m here to offer general health guidance and encourage you to contact a doctor for medical advice if needed.";
};

// POST /ai/chat
router.post("/chat", async (req, res) => {
  try {

    // Get the user's message sent from React
    const { message } = req.body;

    if (!geminiApiKey || !genAI) {
      return res.status(500).json({
        error: "Gemini API key is not configured."
      });
    }

    // Choose the Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    // Tell Gemini how it should behave
    const prompt = `
You are Doctori AI.

You are a helpful medical assistant.

Rules:

- Never diagnose diseases.
- Never prescribe medicine.
- Ask follow-up questions naturally.
- Be friendly.
- Keep answers short.
- If you think the patient should see a doctor,
recommend only a medical specialty.

Patient:

${message}
`;

    // Send the prompt to Gemini
    const result = await model.generateContent(prompt);

    // Get Gemini's answer
    const reply = result.response.text();

    // Send it back to React
    res.json({
      reply
    });

  } catch (error) {

    console.error("Gemini request failed:", error?.message || error);

    res.json({
      reply: getFallbackReply(message)
    });

  }
});

export default router;