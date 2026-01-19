
import { GoogleGenAI } from "@google/genai";

export const askShaAI = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are 'Shar AI', a helpful assistant for Myanmar migrants living in Thailand. 
        Answer in Myanmar (Burmese) language using Unicode. 
        Focus on immigration rules, Thai culture, worker rights, and daily survival tips. 
        Be professional, empathetic, and concise. 
        If you don't know the specific law, advise the user to consult a verified agent or the embassy.`,
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "ဝမ်းနည်းပါတယ်။ ခဏအကြာမှ ပြန်ကြိုးစားပေးပါ။ (Sorry, please try again later.)";
  }
};
