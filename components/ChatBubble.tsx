
import React, { useState } from 'react';
import { Message, Correction } from '../types';
import { CheckCircle2, AlertCircle, HelpCircle, Volume2 } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  onPlaySpeech?: (text: string) => void;
}

const CorrectionCard: React.FC<{ correction: Correction }> = ({ correction }) => {
  return (
    <div className="mt-4 border-l-4 border-indigo-400 bg-indigo-50/50 rounded-r-xl p-4 animate-in fade-in slide-in-from-left-2">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={16} className="text-indigo-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Quick Correction</span>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase">You said:</p>
          <p className="text-sm text-slate-600 italic">"{correction.original}"</p>
        </div>
        
        <div>
          <p className="text-[10px] text-green-500 font-medium uppercase">Better way:</p>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-green-500 mt-0.5" />
            <p className="text-sm text-slate-800 font-medium">{correction.corrected}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-indigo-100/50">
          <div className="flex items-center gap-1.5 mb-1">
            <HelpCircle size={14} className="text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-700">Why?</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{correction.explanation}</p>
        </div>

        {correction.alternative && (
          <div className="bg-white/60 rounded-lg p-2 mt-2">
             <p className="text-[10px] text-slate-400 font-medium uppercase mb-1">Natural Variation:</p>
             <p className="text-xs text-slate-700 font-medium">"{correction.alternative}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onPlaySpeech }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[70%] ${isUser ? 'order-2' : ''}`}>
        <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isUser && (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mb-1">
              <img 
                src="https://picsum.photos/seed/sarah/100/100" 
                className="w-full h-full rounded-full object-cover" 
                alt="Ms. Sarah"
              />
            </div>
          )}
          
          <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-br-none' 
              : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
          }`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
            
            {!isUser && onPlaySpeech && (
              <button 
                onClick={() => onPlaySpeech(message.text)}
                className="mt-2 text-indigo-400 hover:text-indigo-600 transition-colors"
              >
                <Volume2 size={16} />
              </button>
            )}

            <div className={`absolute -bottom-5 whitespace-nowrap text-[10px] text-slate-400 ${isUser ? 'right-0' : 'left-0'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {message.correction && <CorrectionCard correction={message.correction} />}
      </div>
    </div>
  );
};

export default ChatBubble;
