import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const modelsToTest = [
    "gemini-3.1-flash",
    "gemini-3.0-pro",
    "gemini-2.5-flash"
  ];

  for (const m of modelsToTest) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hello");
      console.log(`SUCCESS ${m}:`, result.response.text());
    } catch (e) {
      console.error(`ERROR ${m}:`, e.message);
    }
  }
}
run();
