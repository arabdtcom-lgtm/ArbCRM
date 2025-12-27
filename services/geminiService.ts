
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AMAZON_MARINE_INSTRUCTION, CHAT_MODEL, OFFICIAL_SHIPPING_LINES } from "../constants";
import { ImageSize, Shipment } from "../types";

/**
 * Optimized helper to create a concise context for the AI.
 * Includes Cargo Description for better customer support.
 */
const summarizeShipments = (shipments: Shipment[]): string => {
  if (shipments.length === 0) return "No shipments currently in manifest.";
  return shipments.map(s => 
    `[ID: ${s.trackingNumber}, Customer: ${s.customerName}, Status: ${s.status}, ETA: ${s.eta}, Route: ${s.origin}->${s.destination}, Cargo: ${s.cargoDescription || 'N/A'}]`
  ).join("\n");
};

export const sendMessage = async (
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[] = [],
  shipmentsContext: Shipment[] = []
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contextSummary = summarizeShipments(shipmentsContext);
  const dynamicInstruction = `${AMAZON_MARINE_INSTRUCTION}\n\nLATEST FLEET STATUS SUMMARY:\n${contextSummary}\n\nIf the user asks for a specific tracking number, match it exactly against the IDs above.`;

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
    Provide a professional, data-driven 3-sentence summary of current operations.
    Mention growth trends or risks if visible in the data.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: `JSON_STATE: ${JSON.stringify(data)}` }] }],
    config: { systemInstruction, temperature: 0.3 },
  });

  return response.text;
};

export const parseLogisticsText = async (text: string, context: { salesReps: string[] }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are an expert Logistics Data Parser for a CRM system (Amazon Marine).
    Analyze the unstructured text (emails, invoices, shipping documents) and extract the following entity data into raw JSON.

    STRICT SHIPPING LINE RULES:
    1. You must normalize the found shipping line to match EXACTLY one of the values in the ALLOWED LIST below.
    2. If the found shipping line is a variation (e.g., "CMA CGM" or "Maersk Line"), map it to the closest match.
    3. If no shipping line is found, set the shippingLine.value to null.
    4. ALLOWED LIST: ${OFFICIAL_SHIPPING_LINES.join(', ')}

    FINANCIAL EXTRACTION RULES:
    1. Extract inland freight cost.
    2. Extract "Genset" related costs as gensetCost.
    3. Extract "Official Receipts" or "Government Fees" as officialReceipts.
    4. Extract "Overnight" or "Driver Stay" fees as overnightStay.
    5. Extract any other miscellaneous fees as otherExpenses.

    OTHER RULES:
    1. Dates MUST be YYYY-MM-DD.
    2. Currency MUST be USD or EGP.
    3. Extract the Bill of Lading (B/L) number if present.
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
          salesRep: { type: Type.STRING },
          inlandFreight: { type: Type.NUMBER },
          gensetCost: { type: Type.NUMBER },
          officialReceipts: { type: Type.NUMBER },
          overnightStay: { type: Type.NUMBER },
          otherExpenses: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          eta: { type: Type.STRING },
          weightKg: { type: Type.NUMBER }
        }
      }
    },
  });

  return JSON.parse(response.text || '{}');
};

export const queryCrmData = async (query: string, data: { leads: any[], shipments: any[] }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: query }] }],
    config: {
      systemInstruction: `You are the data intelligence core. Answer concisely based on this CRM state: ${JSON.stringify(data)}`,
      temperature: 0.1,
    },
  });
  return response.text;
};

export const generateImage = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size === '4K' ? '1K' : size as any
      }
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("No image generated.");
};
