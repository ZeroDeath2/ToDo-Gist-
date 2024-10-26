// src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login';
import ProjectList from './components/projectlist';
import ProjectView from './components/projectview';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/projects/:id" element={<ProjectView />} />
      </Routes>
    </Router>
  );
}

export default App;
