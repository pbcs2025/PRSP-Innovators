import { useState, useEffect } from 'react';
import useAuthStore from './store/authStore';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const { token } = useAuthStore();

  if (!token) {
    return <Login />;
  }

  return <Dashboard />;
}

export default App;
