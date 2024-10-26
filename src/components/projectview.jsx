import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useParams } from 'react-router-dom';

export default function ProjectView({ onLogout }) {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [showTodoForm, setShowTodoForm] = useState(false);

  useEffect(() => {
    const fetchProjectAndTodos = async () => {
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        const { data: todosData, error: todosError } = await supabase
          .from('todos')
          .select('*')
          .eq('project_id', id);

        if (todosError) throw todosError;
        setTodos(todosData || []);
      } catch (error) {
        console.error('Error:', error.message);
      }
    };

    fetchProjectAndTodos();
  }, [id]);

  const toggleTodoStatus = async (todoId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
  
      const { error } = await supabase
        .from('todos')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() // Set the current timestamp
        })
        .eq('id', todoId);
  
      if (error) throw error;
  
      // Update local state
      setTodos(todos.map((todo) =>
        todo.id === todoId ? { ...todo, status: newStatus, updated_at: new Date().toISOString() } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error.message);
    }
  };
  const handleAddTodo = async () => {
    try {
      const { error } = await supabase
        .from('todos')
        .insert([{ description: newTodo, status: 'pending', project_id: id }]);

      if (error) throw error;

      // Refresh the todos list after adding
      setNewTodo('');
      setShowTodoForm(false);

      const { data } = await supabase
        .from('todos')
        .select('*')
        .eq('project_id', id);
      setTodos(data || []);
    } catch (error) {
      console.error('Error adding todo:', error.message);
    }
  };

  const pendingTodos = todos.filter(todo => todo.status === 'pending');
  const completedTodos = todos.filter(todo => todo.status === 'completed');

  return (
    <div>
      {project ? (
        <>
          <h2>{project.title}</h2>

          <div>
            <h3>Pending</h3>
            <ul>
              {pendingTodos.map((todo) => (
                <li key={todo.id}>
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleTodoStatus(todo.id, todo.status)}
                  />
                  {' '}
                  {todo.description}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Completed</h3>
            <ul>
              {completedTodos.map((todo) => (
                <li key={todo.id}>
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleTodoStatus(todo.id, todo.status)}
                  />
                  {' '}
                  {todo.description}
                </li>
              ))}
            </ul>
          </div>

          <button onClick={() => setShowTodoForm(!showTodoForm)}>
            {showTodoForm ? 'Cancel' : 'Add Todo'}
          </button>

          {showTodoForm && (
            <div>
              <input
                type="text"
                placeholder="Enter todo name"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
              />
              <button onClick={handleAddTodo}>Add</button>
            </div>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}
