// src/components/ProjectView.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useParams } from 'react-router-dom';

export default function ProjectView() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      const { data } = await supabase.from('projects').select('*').eq('id', id).single();
      setProject(data);
    };

    const fetchTodos = async () => {
      const { data } = await supabase.from('todos').select('*').eq('project_id', id);
      setTodos(data);
    };

    fetchProject();
    fetchTodos();
  }, [id]);

  return (
    <div>
      <h2>{project?.title}</h2>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input type="checkbox" checked={todo.status === 'complete'} readOnly />
            {todo.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
