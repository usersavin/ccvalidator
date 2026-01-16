
import { GoogleGenAI, Type } from "@google/genai";
import { SecurityInsight, CardAnalytics } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getSecurityInsights = async (iin: string): Promise<SecurityInsight[]> => {
  if (!process.env.API_KEY) return [];
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 3 highly professional security or technical insights for a Sri Lankan credit card validator. 
      The IIN is ${iin}. 
      Focus on specific card security standards (EMV, 3DS 2.0), the significance of the 6-digit IIN in identifying banks like Commercial, Sampath, or HNB, and data protection.
      Format: JSON array of objects with "title", "content", and "type" ("security", "feature", "info").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["title", "content", "type"]
          }
        }
      }
    });

    const text = response.text;
    if (text) return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
  }
  return [];
};

export const getCardAnalytics = async (cardNumber: string, bank?: string, country?: string): Promise<CardAnalytics | null> => {
  if (!process.env.API_KEY) return null;
  
  const iin = cardNumber.replace(/\D/g, '').substring(0, 6);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `ACT AS A SENIOR SRI LANKAN FINANCIAL ANALYST. Perform a high-accuracy predictive analysis on a card with IIN ${iin}.
      Context: Bank is ${bank || 'Unknown Bank Sri Lanka'}, Region is ${country || 'Sri Lanka'}.
      
      REQUIREMENTS:
      1. ALL monetary values MUST be in Sri Lankan Rupees (LKR / Rs.).
      2. Analyze the card's likely tier in the Sri Lankan market (Classic, Gold, Platinum, Signature, Infinite, World, etc.).
      3. Predict a REALISTIC LKR estimated balance and credit limit based on common Sri Lankan banking thresholds for that specific tier (e.g., Gold cards often have 100k-500k LKR limits).
      4. Assess a Risk Score (0-100) based on typical BIN usage patterns in South Asia.
      5. Provide a Credit Score Equivalent (e.g. CRIB Rating estimate).

      STRICT JSON FORMAT:
      {
        "estimatedBalanceLKR": "Rs. x,xxx - Rs. x,xxx",
        "spendingLimitLKR": "Rs. x,xxx",
        "riskScore": number,
        "cardTier": "String",
        "trustLevel": "High" | "Medium" | "Low",
        "usageCategory": "Consumer / Corporate / Infinite",
        "creditScoreEquivalent": "A1 / B2 / Good",
        "insights": ["Sri Lanka Specific Insight 1", "Insight 2"]
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      // Ensure the model didn't use $ by accident, force Rs. prefix if missing
      if (parsed.estimatedBalanceLKR && !parsed.estimatedBalanceLKR.includes('Rs.')) {
        parsed.estimatedBalanceLKR = `Rs. ${parsed.estimatedBalanceLKR}`;
      }
      if (parsed.spendingLimitLKR && !parsed.spendingLimitLKR.includes('Rs.')) {
        parsed.spendingLimitLKR = `Rs. ${parsed.spendingLimitLKR}`;
      }
      return parsed;
    }
  } catch (error) {
    console.error("Gemini Analytics Error:", error);
  }
  return null;
};
