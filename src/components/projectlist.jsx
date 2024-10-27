import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id);
          if (error) throw error;
          setProjects(data || []);
        }
      } catch (error) {
        console.error('Error fetching projects:', error.message);
      }
    };

    fetchUserAndProjects();

    const channel = supabase
      .channel('project_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${supabase.auth.getUser().then(res => res.data.user?.id)}`,
        },
        fetchUserAndProjects
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateProject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('projects')
        .insert([{ title: newProjectName, user_id: user.id }]);

      if (error) throw error;

      setNewProjectName('');
      setShowCreateForm(false);

      const { data } = await supabase.from('projects').select('*').eq('user_id', user.id);
      setProjects(data || []);
    } catch (error) {
      console.error('Error creating project:', error.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm("Delete? This action can't be undone. Cancel: Proceed");

    if (!confirmed) return; // Exit if user cancels

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('project_id', projectId); // Delete corresponding todos

      if (error) throw error;

      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId); // Delete the project

      if (projectError) throw projectError;

      // Refresh the project list after deletion
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      {/* Outer Card */}
      <div className="card shadow-lg" style={{ width: '50rem' }}>
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{user?.email || 'Loading...'}</h5>
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
            Logout
          </button>
        </div>

        {/* Inner Card */}
        <div className="card-body">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Projects</h4>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn btn-outline-light btn-sm"
              >
                {showCreateForm ? 'Cancel' : 'Create New Project'}
              </button>
            </div>

            <div className="card-body">
              {showCreateForm && (
                <div className="d-flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Enter project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="form-control"
                  />
                  <button onClick={handleCreateProject} className="btn btn-success">
                    Create
                  </button>
                </div>
              )}

              <ul className="list-group">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{project.title}</span>
                    <div>
                      <button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="btn btn-outline-primary btn-sm me-2"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="card-footer text-center text-muted">
          {projects.length > 0 ? 'Manage your projects efficiently!' : 'No projects available.'}
        </div>
      </div>
    </div>
  );
}
