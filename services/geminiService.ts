
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AMAZON_MARINE_INSTRUCTION, CHAT_MODEL, OFFICIAL_SHIPPING_LINES } from "../constants";
import { ImageSize, Shipment } from "../types";

/**
 * Optimized helper to create a concise context for the AI.
 */
const summarizeShipments = (shipments: Shipment[]): string => {
  if (shipments.length === 0) return "No shipments currently in manifest.";
  return shipments.map(s => 
    `[ID: ${s.trackingNumber}, Customer: ${s.customerName}, Status: ${s.status}, ETA: ${s.eta}, Origin: ${s.origin}, Dest: ${s.destination}]`
  ).join("\n");
};

export const sendMessage = async (
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[] = [],
  shipmentsContext: Shipment[] = []
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contextSummary = summarizeShipments(shipmentsContext);
  const dynamicInstruction = `${AMAZON_MARINE_INSTRUCTION}\n\nLATEST FLEET DATA (GROUNDING):\n${contextSummary}\n\nIf the user asks for tracking, check the IDs above. If you find a match, give the current status and ETA. Respond in Arabic.`;

  const chat = ai.chats.create({
    model: CHAT_MODEL,
    config: {
      systemInstruction: dynamicInstruction,
      temperature: 0.6,
    },
    history,
  });

  const response: GenerateContentResponse = await chat.sendMessage({ message });
  return response.text;
};

export const generateDashboardBrief = async (data: { leads: any[], shipments: any[] }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `
    You are the "Amazon Marine Strategic Advisor". 
    Provide a professional, data-driven 2-sentence summary of current operations.
    Focus on active manifest count and conversion status. Be extremely concise.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `CRM_STATE: ${JSON.stringify(data)}` }] }],
    config: { systemInstruction, temperature: 0.3 },
  });

  return response.text;
};

export const parseLogisticsText = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are an expert Logistics Data Parser for a CRM system (Amazon Marine).
    Analyze the text and extract shipping information.

    STRICT RULES:
    1. Output raw JSON ONLY.
    2. Normalize "Shipping Line" to match EXACTLY one of: ${OFFICIAL_SHIPPING_LINES.join(', ')}.
    3. If no match is found, set to null.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          customerName: { type: Type.STRING },
          trackingNumber: { type: Type.STRING },
          blNumber: { type: Type.STRING },
          bookingNumber: { type: Type.STRING },
          shippingLine: { 
            type: Type.OBJECT,
            properties: {
                value: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                originalTextDetected: { type: Type.STRING }
            },
            required: ["value", "confidence", "originalTextDetected"]
          },
          origin: { type: Type.STRING },
          destination: { type: Type.STRING },
          cargoDescription: { type: Type.STRING },
          inlandFreight: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          eta: { type: Type.STRING }
        }
      }
    },
  });

  return JSON.parse(response.text || '{}');
};

export const generateImage = async (prompt: string, size: ImageSize): Promise<string> => {
  const model = (size === '2K' || size === '4K') ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: size === '4K' ? '1K' : size as any
      }
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("Image generation failed.");
};
