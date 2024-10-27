import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import exportAsGist from "./ExportGist"; // Import the export function

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUserData();

    const fetchProjectAndTodos = async () => {
      try {
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        const { data: todosData, error: todosError } = await supabase
          .from("todos")
          .select("*")
          .eq("project_id", id);

        if (todosError) throw todosError;
        setTodos(todosData || []);
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    fetchProjectAndTodos();
  }, [id]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const toggleTodoStatus = async (todoId, currentStatus) => {
    try {
      const newStatus = currentStatus === "pending" ? "completed" : "pending";
      const { error } = await supabase
        .from("todos")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", todoId);

      if (error) throw error;

      setTodos(
        todos.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : todo
        )
      );
    } catch (error) {
      console.error("Error updating todo:", error.message);
    }
  };

  const handleAddTodo = async () => {
    try {
      const { error } = await supabase
        .from("todos")
        .insert([{ description: newTodo, status: "pending", project_id: id }]);

      if (error) throw error;

      setNewTodo("");
      setShowTodoForm(false);

      const { data } = await supabase
        .from("todos")
        .select("*")
        .eq("project_id", id);
      setTodos(data || []);
    } catch (error) {
      console.error("Error adding todo:", error.message);
    }
  };

  const handleExportGist = async (isPublic) => {
    try {
      const totalTasks = todos.length;
      const completedTasks = todos.filter(
        (todo) => todo.status === "completed"
      ).length;

      const content = `
# ${project?.title || "Untitled Project"}
Summary: ${completedTasks}/${totalTasks} completed

## Pending
${todos
  .filter((todo) => todo.status === "pending")
  .map((todo) => `- [ ] ${todo.description}`)
  .join("\n")}

## Completed
${todos
  .filter((todo) => todo.status === "completed")
  .map((todo) => `- [x] ${todo.description}`)
  .join("\n")}
      `.trim();

      try {
        await exportAsGist(
          project?.title || "Untitled Project",
          content,
          isPublic
        );
        // Close dropdown after successful export
        setDropdownOpen(false);
      } catch (error) {
        console.error("Error exporting gist:", error);
        alert("Failed to export gist. Please check your GitHub connection.");
      }
    } catch (error) {
      console.error("Error preparing gist content:", error);
      alert("Failed to prepare content for export.");
    }
  };

  const handleUpdateTodo = async (todoId, updatedDescription) => {
    await supabase
      .from("todos")
      .update({ description: updatedDescription })
      .eq("id", todoId);

    setTodos((todos) =>
      todos.map((todo) =>
        todo.id === todoId ? { ...todo, description: updatedDescription } : todo
      )
    );
  };

  const handleRemoveTodo = async (todoId) => {
    await supabase.from("todos").delete().eq("id", todoId);
    setTodos((todos) => todos.filter((todo) => todo.id !== todoId));
  };

  const handleDownloadMarkdownFile = () => {
    const totalTasks = todos.length;
    const completedTasks = todos.filter(
      (todo) => todo.status === "completed"
    ).length;

    // Create the content for the markdown file
    const content = `
# ${project?.title || "Untitled Project"}
Summary: ${completedTasks}/${totalTasks} completed

## Pending
${todos
  .filter((todo) => todo.status === "pending")
  .map((todo) => `- [ ] ${todo.description}`)
  .join("\n")}

## Completed
${todos
  .filter((todo) => todo.status === "completed")
  .map((todo) => `- [x] ${todo.description}`)
  .join("\n")}
    `.trim(); // Trim to remove extra whitespace

    // Create a Blob and download
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.title || "Untitled Project"}.md`; // Set the file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pendingTodos = todos.filter((todo) => todo.status === "pending");
  const completedTodos = todos.filter((todo) => todo.status === "completed");

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card shadow-lg" style={{ width: "50rem" }}>
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{user?.email || "Loading..."}</h5>
          <button
            onClick={handleSignOut}
            className="btn btn-outline-light btn-sm"
          >
            Logout
          </button>
        </div>

        <div className="card-body">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{project?.title || "Loading..."}</h4>
              <button
                onClick={() => navigate("/")}
                className="btn btn-outline-light btn-sm"
              >
                Back
              </button>
            </div>

            <div className="card-body">
              {pendingTodos.length > 0 && (
                <>
                  <h5>Pending Tasks</h5>
                  <ul className="list-group mb-3">
                    {pendingTodos.map((todo) => (
                      <li
                        key={todo.id}
                        className="list-group-item d-flex align-items-center"
                      >
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={false}
                          onChange={() =>
                            toggleTodoStatus(todo.id, todo.status)
                          }
                        />
                        <span className="flex-grow-1">{todo.description}</span>
                        <button
                          onClick={() => {
                            const newDescription = prompt(
                              "Update Todo",
                              todo.description
                            );
                            if (newDescription)
                              handleUpdateTodo(todo.id, newDescription);
                          }}
                          className="btn btn-warning btn-sm me-2"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleRemoveTodo(todo.id)}
                          className="btn btn-danger btn-sm"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {completedTodos.length > 0 && (
                <>
                  <h5>Completed Tasks</h5>
                  <ul className="list-group mb-3">
                    {completedTodos.map((todo) => (
                      <li
                        key={todo.id}
                        className="list-group-item d-flex align-items-center text-muted"
                      >
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={true}
                          onChange={() =>
                            toggleTodoStatus(todo.id, todo.status)
                          }
                        />
                        <span className="flex-grow-1 text-decoration-line-through">{todo.description}</span>
                        <button
                          onClick={() => {
                            const newDescription = prompt(
                              "Update Todo",
                              todo.description
                            );
                            if (newDescription)
                              handleUpdateTodo(todo.id, newDescription);
                          }}
                          className="btn btn-warning btn-sm me-2"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleRemoveTodo(todo.id)}
                          className="btn btn-danger btn-sm"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="d-flex justify-content-between mt-3">
                <button
                  onClick={() => setShowTodoForm(true)}
                  className="btn btn-primary"
                >
                  Add Todo
                </button>
                <div>
                  <div className="dropdown d-inline-block me-2">
                    <button
                      className="btn btn-secondary dropdown-toggle"
                      type="button"
                      id="exportGistDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded={dropdownOpen}
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <i className="bi bi-share me-1"></i>
                      Export as Gist
                    </button>
                    <ul
                      className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}
                      aria-labelledby="exportGistDropdown"
                    >
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleExportGist(true)}
                        >
                          <i className="bi bi-globe me-2"></i>
                          Public Gist
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleExportGist(false)}
                        >
                          <i className="bi bi-lock me-2"></i>
                          Secret Gist
                        </button>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={handleDownloadMarkdownFile}
                    className="btn btn-info"
                  >
                    Download Markdown
                  </button>
                </div>
              </div>

              {showTodoForm && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Enter todo description"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    className="form-control mb-2"
                  />
                  <div className="d-flex justify-content-end gap-2">
                    <button onClick={handleAddTodo} className="btn btn-success">
                      Add
                    </button>
                    <button
                      onClick={() => setShowTodoForm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-footer text-center text-muted">
          {project
            ? "Manage your project tasks effectively!"
            : "Loading project details..."}
        </div>
      </div>
    </div>
  );
}
