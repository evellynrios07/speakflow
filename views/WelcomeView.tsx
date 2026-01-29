
import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, Target, GraduationCap } from 'lucide-react';
import { UserProfile, ProficiencyLevel, LearningGoal } from '../types';

interface WelcomeViewProps {
  onComplete: (profile: UserProfile) => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<ProficiencyLevel>('Intermediate');
  const [goal, setGoal] = useState<LearningGoal>('Conversation');
  const [step, setStep] = useState(1);

  const levels: ProficiencyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
  const goals: LearningGoal[] = ['Conversation', 'Business', 'Travel', 'Exams'];

  const handleFinish = () => {
    if (name.trim()) {
      onComplete({ name, level, goal });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-indigo-100 overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Sparkles size={32} />
          </div>
          <h1 className="text-2xl font-bold">Welcome to SpeakFlow</h1>
          <p className="text-indigo-100 text-sm mt-2">Let's personalize your English journey.</p>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <User size={14} /> What's your name?
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
                  placeholder="Enter your name..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-indigo-500 focus:outline-none transition-all text-lg font-medium"
                />
              </div>
              <button
                disabled={!name.trim()}
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <GraduationCap size={14} /> Your English Level
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {levels.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                        level === l 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-100 hover:border-indigo-200 text-slate-500'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Target size={14} /> Your Goal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {goals.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`px-4 py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                        goal === g 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-100 hover:border-indigo-200 text-slate-500'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all"
                >
                  Start Learning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeView;
