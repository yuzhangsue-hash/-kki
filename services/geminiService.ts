
import { GoogleGenAI, Type } from "@google/genai";
import { WishResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getLuxuryWish = async (userVibe: string): Promise<WishResponse> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user's Christmas vibe is: "${userVibe}". Act as a sophisticated Arix Signature Concierge. Generate a luxurious response including a message, a bespoke gift recommendation, and a short affirmation.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          message: { type: Type.STRING, description: "A sophisticated greeting." },
          luxuryGift: { type: Type.STRING, description: "An ultra-luxurious gift idea." },
          affirmation: { type: Type.STRING, description: "A high-class holiday affirmation." },
        },
        required: ["message", "luxuryGift", "affirmation"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {
      message: "May your holidays be as radiant as the finest emeralds.",
      luxuryGift: "A custom-crafted golden timepiece.",
      affirmation: "You are the architect of your own brilliance."
    };
  }
};
