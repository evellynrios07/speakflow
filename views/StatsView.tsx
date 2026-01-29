
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

const data = [
  { name: 'Mon', sentences: 12 },
  { name: 'Tue', sentences: 18 },
  { name: 'Wed', sentences: 15 },
  { name: 'Thu', sentences: 24 },
  { name: 'Fri', sentences: 32 },
  { name: 'Sat', sentences: 10 },
  { name: 'Sun', sentences: 5 },
];

const StatsView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Target className="text-indigo-600" />, label: 'Accuracy', value: '78%', color: 'bg-indigo-50' },
          { icon: <TrendingUp className="text-green-600" />, label: 'Fluency', value: 'B2', color: 'bg-green-50' },
          { icon: <AlertTriangle className="text-amber-600" />, label: 'Corrections', value: '42', color: 'bg-amber-50' },
          { icon: <Clock className="text-purple-600" />, label: 'Study Time', value: '4.5h', color: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Practice Activity</h3>
            <select className="text-xs border-none bg-slate-50 rounded-lg p-1 text-slate-500">
              <option>Last 7 Days</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="sentences" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#4f46e5' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Common Mistakes</h3>
          <div className="space-y-4">
            {[
              { label: 'Subject-Verb Agreement', count: 12, color: 'bg-red-400' },
              { label: 'Article Usage (a/an/the)', count: 9, color: 'bg-amber-400' },
              { label: 'Prepositions of Time', count: 7, color: 'bg-indigo-400' },
              { label: 'Irregular Past Tense', count: 4, color: 'bg-green-400' },
            ].map((mistake, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">{mistake.label}</span>
                  <span className="text-slate-400">{mistake.count} times</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${mistake.color} rounded-full`} 
                    style={{ width: `${(mistake.count / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 border border-indigo-100 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors">
            Review Mistakes
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Milestones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-dashed border-slate-200 rounded-xl flex items-center gap-4 grayscale opacity-50">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">🏆</div>
            <div>
              <p className="text-sm font-bold text-slate-700">Vocabulary Master</p>
              <p className="text-xs text-slate-400">Learn 500 new words</p>
            </div>
          </div>
          <div className="p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl">🔥</div>
            <div>
              <p className="text-sm font-bold text-slate-700">On Fire!</p>
              <p className="text-xs text-indigo-600 font-medium">5 Day Streak</p>
            </div>
          </div>
          <div className="p-4 border border-dashed border-slate-200 rounded-xl flex items-center gap-4 grayscale opacity-50">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">🗣️</div>
            <div>
              <p className="text-sm font-bold text-slate-700">Native Speaker</p>
              <p className="text-xs text-slate-400">30 min voice session</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
