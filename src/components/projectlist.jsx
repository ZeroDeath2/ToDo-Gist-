import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Get the current user session
        const { data: { user } } = await supabase.auth.getUser();
        console.log(user);

        if (user) {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id);

          if (error) throw error;
          setProjects(data || []);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error.message);
        setProjects([]);
      }
    };

    fetchProjects();

    // Set up real-time subscription for projects
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
        () => fetchProjects()
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

      // Clear the input field and hide the form
      setNewProjectName('');
      setShowCreateForm(false);

      // Fetch the updated project list
      const { data } = await supabase.from('projects').select('*').eq('user_id', user.id);
      setProjects(data || []);
    } catch (error) {
      console.error('Error creating project:', error.message);
    }
  };

  return (
    <div>
      <h2>Projects</h2>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <a href={`/projects/${project.id}`}>{project.title}</a>
          </li>
        ))}
      </ul>

      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create New Project'}
      </button>

      {showCreateForm && (
        <div>
          <input
            type="text"
            placeholder="Enter project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <button onClick={handleCreateProject}>Create</button>
        </div>
      )}
    </div>
  );
}
