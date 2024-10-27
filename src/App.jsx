import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { supabase } from "./supabase"; // Import Supabase client
import Login from "./components/login";
import ProjectList from "./components/projectlist";
import ProjectView from "./components/projectview";
import Layout from "./components/Layout"; // Assuming you have a Layout component

const App = () => {
  const [userId, setUserId] = useState(null); // State to hold the user ID

  const handleUserIdChange = (id) => {
    setUserId(id); // Update user ID state
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUserId(null); // Clear user ID on logout
      window.location.href = "/login"; // Redirect to login page
    } else {
      console.error("Error during logout:", error.message);
    }
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            exact
            path="/"
            element={
              <Login
                onUserIdChange={handleUserIdChange}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/projects"
            element={<ProjectList userId={userId} onLogout={handleLogout} />}
          />
          <Route
            exact
            path="/projects/:id"
            element={<ProjectView onLogout={handleLogout} />}
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
