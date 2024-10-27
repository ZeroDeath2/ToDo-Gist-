import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from "./supabase"; // Import Supabase client
import Login from "./components/login";
import ProjectList from "./components/projectlist";
import ProjectView from "./components/projectview";

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
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/projects"
          element={<ProjectList userId={userId} onLogout={handleLogout} />}
        />
        <Route
          path="/projects/:id"
          element={<ProjectView onLogout={handleLogout} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
