
import React from 'react';
import { UserProfile, ProficiencyLevel, LearningGoal } from '../types';
import { Save, User, MapPin, Globe, Shield, Bell } from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, setProfile }) => {
  const levels: ProficiencyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
  const goals: LearningGoal[] = ['Conversation', 'Business', 'Travel', 'Exams'];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6">
            <img 
              src="https://picsum.photos/seed/user123/200/200" 
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-md"
              alt="Profile"
            />
            <div className="absolute bottom-0 left-20 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{profile.name}</h3>
              <p className="text-sm text-slate-500">Dedicated language learner since 2024</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Display Name</span>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Learning Level</span>
                  <div className="grid grid-cols-3 gap-2">
                    {levels.map(l => (
                      <button
                        key={l}
                        onClick={() => setProfile({ ...profile, level: l })}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          profile.level === l 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Primary Goal</span>
                  <select 
                    value={profile.goal}
                    onChange={(e) => setProfile({ ...profile, goal: e.target.value as LearningGoal })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    {goals.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profile Badges</h4>
                  <div className="flex gap-2">
                    <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm" title="Active Student">🏅</span>
                    <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm" title="Grammar Ninja">🥷</span>
                    <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm" title="Early Bird">🐦</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-500">
                    <MapPin size={16} />
                    <span className="text-sm">São Paulo, Brazil</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Globe size={16} />
                    <span className="text-sm">Native: Portuguese</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end">
              <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                <Save size={18} />
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <Shield size={18} />, label: 'Privacy & Security' },
          { icon: <Bell size={18} />, label: 'Notifications' },
          { icon: <Globe size={18} />, label: 'App Language' },
        ].map((item, i) => (
          <button key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors">
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileView;
