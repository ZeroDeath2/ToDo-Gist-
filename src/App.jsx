// src/App.js
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { supabase } from './supabase'; // Import Supabase client
import Login from './components/Login';
import ProjectList from './components/ProjectList';
import ProjectView from './components/ProjectView';

function App() {
  const [userId, setUserId] = useState(null); // State to hold the user ID

  const handleUserIdChange = (id) => {
    setUserId(id); // Update user ID state
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUserId(null); // Clear user ID on logout
      window.location.href = '/login'; // Redirect to login page
    } else {
      console.error('Error during logout:', error.message);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectList userId={userId} onLogout={handleLogout} />} />
        <Route path="/login" element={<Login onUserIdChange={handleUserIdChange} onLogout={handleLogout} />} />
        <Route path="/projects/:id" element={<ProjectView onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}

export default App;
