import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Initialization
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/coach/chat", async (req, res) => {
    try {
      const { message, context, history } = req.body;
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are Ascend, an elite executive career coach. 
          Your goal is to democratize high-level professional guidance for everyone.
          
          Context about the user:
          ${JSON.stringify(context)}
          
          Guidelines:
          1. Be professional, encouraging, and insightful.
          2. Use frameworks like GROW (Goal, Reality, Options, Will) or SWOT analysis.
          3. Focus on actionable steps.
          4. When acting in a simulation, roleplay, or guided toolbox scenario, DO NOT provide all answers or the full plan upfront. Provide brief introductory guidance, then lead an interactive conversation by asking ONE question at a time.
          5. Only provide your final evaluation or comprehensive recommendations AFTER gathering enough context through sequential questions.
          6. Always maintain a coach-like stance: ask probing questions rather than just giving answers.
          7. Format your output clearly with Markdown.`
        }
      });

      // Convert history to format required by new SDK if necessary, 
      // but if it's already in the right format we can use it.
      // The new SDK uses { message: string } for sendMessage.
      
      const result = await chat.sendMessage({ message });
      res.json({ text: result.text });
    } catch (error: any) {
      const errorStr = error.message || String(error);
      const isQuotaError = errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("429");
      
      if (!isQuotaError) {
        console.error("Gemini Error:", error);
      } else {
        console.warn("Gemini API Rate Limit hit. User is being informed to hold on.");
      }
      
      let statusCode = 500;
      let errorMessage = "I'm sorry, I encountered an internal error. Please try again later.";
      let retryAfter = 0;

      if (errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("429")) {
        statusCode = 429;
        errorMessage = "The AI Coach is currently taking dynamic strategy breaths (API Quota Exceeded). Please wait a moment or try again later today.";
        
        // Try to extract retry delay from the error message if it's JSON-like or has the "retry in" string
        try {
          // Match "retry in 58.297s" or similar
          const match = errorStr.match(/retry in ([\d.]+)s/i);
          if (match) {
            retryAfter = Math.ceil(parseFloat(match[1]));
          } else {
            // Check for JSON details
            const jsonMatch = errorStr.match(/{.*}/s);
            if (jsonMatch) {
              const details = JSON.parse(jsonMatch[0]);
              // Check various formats Google might use
              const retryInfo = details.error?.details?.find((d: any) => d["@type"]?.includes("RetryInfo"));
              if (retryInfo?.retryDelay) {
                // Could be "60s" or 60
                retryAfter = typeof retryInfo.retryDelay === 'string' 
                  ? parseInt(retryInfo.retryDelay) 
                  : retryInfo.retryDelay;
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse error details", e);
        }
      }

      res.status(statusCode).json({ 
        error: errorMessage, 
        retryAfter,
        details: errorStr
      });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
