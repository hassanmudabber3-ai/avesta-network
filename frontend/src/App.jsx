import { useState } from 'react';

import TelegramAuthPage
  from './pages/auth/TelegramAuthPage.jsx';

import HomePage
  from './pages/HomePage.jsx';

import TasksPage
  from './pages/TasksPage.jsx';

import MiningPage
  from './pages/MiningPage.jsx';

import WalletPage
  from './pages/WalletPage.jsx';

export default function App() {
  const [authenticated, setAuthenticated] =
    useState(
      Boolean(
        sessionStorage.getItem('avc_token')
      )
    );

  const [page, setPage] =
    useState('home');

  if (!authenticated) {
    return (
      <TelegramAuthPage
        onLoginSuccess={() =>
          setAuthenticated(true)
        }
      />
    );
  }

  if (page === 'tasks') {
    return (
      <TasksPage
        onNavigate={setPage}
      />
    );
  }

  if (page === 'mining') {
    return (
      <MiningPage
        onNavigate={setPage}
      />
    );
  }

  if (page === 'wallet') {
    return (
      <WalletPage
        onNavigate={setPage}
      />
    );
  }

  return (
    <HomePage
      onNavigate={setPage}
    />
  );
}
