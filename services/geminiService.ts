import { GoogleGenAI } from "@google/genai";

// Safely access process.env to avoid runtime crashes in environments where process is undefined
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAdCopy = async (productName: string, features: string): Promise<string> => {
  if (!apiKey) return "API Key not configured.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Escreva um anúncio de venda curto, atraente e persuasivo para um produto chamado "${productName}" com as seguintes características: ${features}. O público alvo é Angola. Use emojis e moeda Kz se necessário.`,
    });
    return response.text || "Não foi possível gerar o anúncio.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao conectar com o assistente AI.";
  }
};

export const analyzeBusinessStats = async (views: number, clicks: number): Promise<string> => {
    if (!apiKey) return "Simulação: O seu desempenho está ótimo! Considere promover mais produtos.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analise estes dados de uma pequena empresa em Angola: ${views} visualizações e ${clicks} cliques. Dê 3 dicas rápidas de marketing para melhorar as vendas.`
        });
        return response.text || "Sem análise disponível.";
    } catch (error) {
        return "Erro na análise.";
    }
}