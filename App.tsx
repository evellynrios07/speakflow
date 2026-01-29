
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ChatView from './views/ChatView';
import StatsView from './views/StatsView';
import ProfileView from './views/ProfileView';
import WelcomeView from './views/WelcomeView';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '', // Começa vazio para forçar o onboarding
    level: 'Intermediate',
    goal: 'Conversation',
  });

  const [hasStarted, setHasStarted] = useState(false);

  // Se o nome estiver vazio ou o usuário não tiver "começado", mostra a tela de boas-vindas
  if (!profile.name || !hasStarted) {
    return (
      <WelcomeView 
        onComplete={(data) => {
          setProfile(data);
          setHasStarted(true);
        }} 
      />
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ChatView profile={profile} />} />
          <Route path="/stats" element={<StatsView />} />
          <Route path="/profile" element={<ProfileView profile={profile} setProfile={setProfile} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
