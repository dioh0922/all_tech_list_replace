import { GoogleGenAI } from "@google/genai";
import { readFile } from "fs/promises";
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

export const generateEmbedding = async (text: string) => {
    const resultEmbed = await ai.models.embedContent({
        model: "gemini-embedding-2",
        contents: text,
        config:{
          outputDimensionality: 768
        }
    })
    const embedding = resultEmbed?.embeddings ? resultEmbed.embeddings[0].values : null;
    return embedding;
}

export const generateIdea = async (question: string, existItems: any[]) => {
  const prompt = await readFile('./resource/prompt/ask_base_prompt.txt', 'utf-8')
  const injectStr = existItems.map((item: any, index: number) => `${index + 1}: ${item.projectName}: ${item.techName}: ${item.description}`).join('\n\n')
  const finalPrompt = prompt
    .replace('${userInput}', question)
    .replace('${exist_tech_list}', injectStr)
  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: finalPrompt,
    config: {
      temperature: 0.2,
    }
  })
  return result?.text || "No answer generated.";
}