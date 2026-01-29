
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, X, Activity, AlertCircle, Sparkles, Settings, Volume2 } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { Message, UserProfile } from '../types';
import { LiveServerMessage } from '@google/genai';
import ChatBubble from '../components/ChatBubble';
import { createPcmBlob, decodeBase64, decodeAudioData } from '../utils/audio';

const ChatView: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Transcrições em tempo real (o que está sendo dito agora)
  const [activeUserText, setActiveUserText] = useState('');
  const [activeSarahText, setActiveSarahText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  // Histórico da sessão de voz atual
  const [liveSessionHistory, setLiveSessionHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);

  // Refs para controle preciso sem re-renderizações excessivas
  const accumulatedUserText = useRef('');
  const accumulatedSarahText = useRef('');
  const liveScrollRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const geminiRef = useRef<GeminiService>(new GeminiService());
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    const init = async () => {
      await geminiRef.current.initChat(profile);
      const initialMessage: Message = {
        id: '1',
        role: 'model',
        text: `Hi ${profile.name}! I'm Ms. Sarah, your English teacher. It's great to meet you! Are you ready to practice for your ${profile.goal} goals today?`,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    };
    init();
    return () => stopLiveSession();
  }, [profile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (liveScrollRef.current) {
      liveScrollRef.current.scrollTop = liveScrollRef.current.scrollHeight;
    }
  }, [messages, activeUserText, activeSarahText, liveSessionHistory]);

  const initAudioContexts = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
  };

  const startLiveSession = async () => {
    await initAudioContexts();
    setConnectionError(null);
    setIsLiveMode(true);
    setLiveSessionHistory([]);
    setActiveUserText('');
    setActiveSarahText('');
    accumulatedUserText.current = '';
    accumulatedSarahText.current = '';
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      inputCtxRef.current = inputCtx;

      sessionPromiseRef.current = geminiRef.current.connectLive(profile, {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            let sum = 0;
            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
            setAudioLevel(Math.sqrt(sum / inputData.length));

            const pcm = createPcmBlob(inputData);
            sessionPromiseRef.current?.then(session => {
              session.sendRealtimeInput({ media: pcm });
            }).catch(err => console.error("Session Send Error:", err));
          };
          
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.inputTranscription) {
            const chunk = message.serverContent.inputTranscription.text;
            accumulatedUserText.current += chunk;
            setActiveUserText(accumulatedUserText.current);
          }
          
          if (message.serverContent?.outputTranscription) {
            const chunk = message.serverContent.outputTranscription.text;
            accumulatedSarahText.current += chunk;
            setActiveSarahText(accumulatedSarahText.current);
          }

          const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData) {
            const ctx = audioCtxRef.current!;
            if (ctx.state === 'suspended') await ctx.resume();
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decodeBase64(audioData), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            activeSourcesRef.current.add(source);
            source.onended = () => activeSourcesRef.current.delete(source);
          }

          if (message.serverContent?.interrupted) {
            activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
            activeSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            accumulatedSarahText.current = '';
            setActiveSarahText('');
          }

          if (message.serverContent?.turnComplete) {
            const finalUText = accumulatedUserText.current.trim();
            const finalSText = accumulatedSarahText.current.trim();

            if (finalUText || finalSText) {
              const newEntries: {role: 'user' | 'model', text: string}[] = [];
              if (finalUText) newEntries.push({role: 'user', text: finalUText});
              if (finalSText) newEntries.push({role: 'model', text: finalSText});

              setLiveSessionHistory(prev => [...prev, ...newEntries]);

              setMessages(prev => [
                ...prev,
                ...newEntries.map((e, i) => ({
                  id: `${Date.now()}-${i}`,
                  role: e.role,
                  text: e.text,
                  timestamp: new Date()
                }))
              ]);
            }

            accumulatedUserText.current = '';
            accumulatedSarahText.current = '';
            setActiveUserText('');
            setActiveSarahText('');
          }
        },
        onclose: () => { if (isLiveMode) stopLiveSession(); },
        onerror: () => { setConnectionError("Connection lost. Please try again."); }
      });

    } catch (e) {
      setConnectionError("Mic access denied.");
      setTimeout(() => setIsLiveMode(false), 3000);
    }
  };

  const stopLiveSession = () => {
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    if (inputCtxRef.current) { inputCtxRef.current.close(); inputCtxRef.current = null; }
    sessionPromiseRef.current?.then(session => { try { session.close(); } catch(e) {} });
    sessionPromiseRef.current = null;
    setIsLiveMode(false);
    setAudioLevel(0);
  };

  const handleSendText = async () => {
    if (!inputValue.trim() || isLoading) return;
    await initAudioContexts();
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { responseText, correction } = await geminiRef.current.sendMessage(userMsg.text);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        correction,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (audioCtxRef.current) geminiRef.current.playTts(responseText, audioCtxRef.current);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#fdfdfd]">
      
      {isLiveMode && (
        <div className="absolute inset-0 z-[100] bg-slate-950 flex flex-col text-white animate-in fade-in duration-500">
          
          <div className="flex justify-between items-center p-6 sm:p-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping" />
                <div className="relative w-3 h-3 bg-red-500 rounded-full" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Sarah Voice Live</span>
            </div>
            <button onClick={stopLiveSession} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all active:scale-90">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-end px-6 sm:px-12 overflow-hidden pb-10">
            
            <div ref={liveScrollRef} className="w-full max-w-2xl overflow-y-auto space-y-8 mb-10 chat-scrollbar mask-gradient-b">
              {liveSessionHistory.map((item, i) => (
                <div key={i} className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'} opacity-40 hover:opacity-100 transition-opacity duration-500`}>
                  <p className={`text-lg sm:text-xl leading-relaxed ${item.role === 'user' ? 'text-right font-light text-indigo-300' : 'text-left font-medium text-emerald-300'}`}>
                    {item.text}
                  </p>
                </div>
              ))}
              
              <div className="space-y-6 pt-4 border-t border-white/5">
                {activeUserText && (
                  <div className="flex flex-col items-end animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-2">You are speaking</span>
                    <p className="text-2xl sm:text-4xl text-right font-light text-white italic leading-tight">
                      {activeUserText}
                    </p>
                  </div>
                )}
                
                {activeSarahText && (
                  <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Sarah</span>
                    <p className="text-2xl sm:text-4xl text-left font-bold text-white leading-tight">
                      {activeSarahText}
                    </p>
                  </div>
                )}

                {!activeUserText && !activeSarahText && (
                  <div className="flex flex-col items-center gap-6 py-10 opacity-30">
                     <div 
                        className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center transition-transform duration-75"
                        style={{ transform: `scale(${1 + audioLevel * 5})` }}
                     >
                        <Mic size={32} className="text-indigo-400" />
                     </div>
                     <p className="text-xs font-medium tracking-[0.4em] uppercase">I'm listening...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-10 flex justify-center shrink-0">
            <button 
              onClick={stopLiveSession} 
              className="flex items-center gap-4 bg-white/10 border border-white/10 hover:bg-red-500 hover:border-red-500 text-white px-10 py-5 rounded-3xl font-bold transition-all hover:scale-105 active:scale-95"
            >
              <MicOff size={20} />
              Stop Lesson
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-100">
             <img src="https://picsum.photos/seed/sarah/100/100" alt="Sarah" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-800">Teacher Sarah</h3>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ready to help {profile.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 chat-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <ChatBubble 
              key={msg.id} 
              message={msg} 
              onPlaySpeech={(text) => {
                initAudioContexts();
                if (audioCtxRef.current) geminiRef.current.playTts(text, audioCtxRef.current);
              }} 
            />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 px-5 py-4 rounded-2xl rounded-bl-none flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto flex gap-4">
          <button 
            onClick={startLiveSession} 
            className="group relative flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
          >
            <Mic size={28} />
          </button>
          
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder={`Type to Ms. Sarah...`}
              className="flex-1 bg-slate-50 border-none rounded-2xl px-6 focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium transition-all"
            />
            <button
              onClick={handleSendText}
              disabled={!inputValue.trim() || isLoading}
              className="w-16 h-16 flex items-center justify-center bg-slate-900 rounded-2xl text-white hover:bg-slate-800 disabled:opacity-10 transition-all active:scale-95"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
