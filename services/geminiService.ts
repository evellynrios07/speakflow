
import { GoogleGenAI, Type, GenerateContentResponse, Modality, LiveServerMessage } from "@google/genai";
import { UserProfile, Message, Correction } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";
import { decodeBase64, decodeAudioData } from "../utils/audio";

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async initChat(profile: UserProfile) {
    this.chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION(profile),
        temperature: 0.7,
      },
    });
  }

  async sendMessage(text: string): Promise<{ responseText: string; correction?: Correction }> {
    if (!this.chat) throw new Error("Chat not initialized");
    const result = await this.chat.sendMessage({ message: text });
    const response: GenerateContentResponse = result;
    const fullText = response.text || "";

    const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/);
    let cleanText = fullText.replace(/```json\n([\s\S]*?)\n```/, "").trim();
    let correction: Correction | undefined;

    if (jsonMatch) {
      try {
        correction = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse correction JSON", e);
      }
    }
    return { responseText: cleanText, correction };
  }

  /**
   * Conecta à Live API para conversação em voz de baixa latência.
   * Cria uma nova instância de GoogleGenAI para garantir o uso da chave mais recente.
   */
  connectLive(profile: UserProfile, callbacks: any) {
    const liveAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return liveAi.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: `You are Ms. Sarah, a patient English teacher. 
        The student is ${profile.name} at ${profile.level} level. 
        Your goal is ${profile.goal}. Speak clearly and naturally. 
        Keep your spoken responses concise to encourage the student to talk more.`,
        inputAudioTranscription: {}, 
        outputAudioTranscription: {},
      },
    });
  }

  async playTts(text: string, audioCtx: AudioContext) {
    if (!text || text.trim().length === 0) return;
    
    try {
      const ttsAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ttsAi.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text.substring(0, 500) }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
      }
    } catch (e) {
      console.warn("TTS Service unavailable (500), using visual fallback.");
    }
  }
}
