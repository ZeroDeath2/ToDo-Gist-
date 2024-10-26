// src/components/ProjectList.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*');
      setProjects(data);
    };
    fetchProjects();
  }, []);

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
    </div>
  );
}
