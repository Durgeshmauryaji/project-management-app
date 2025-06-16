import React, { useState, useEffect, useCallback } from "react";
import axios from "../axios";
import { toast } from "react-toastify";

function TaskList({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const token = localStorage.getItem("authToken");

  // ✅ fetchTasks wrapped in useCallback to avoid linting warnings
  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(`/tasks/${projectId}`, {
        headers: { Authorization: token },
      });
      setTasks(res.data);
    } catch (err) {
      toast.error("Failed to fetch tasks");
    }
  }, [projectId, token]);

  // ✅ useEffect with fetchTasks dependency
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ✅ Create new task
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      await axios.post(
        "/tasks",
        { title, projectId, assignedTo, deadline },
        { headers: { Authorization: token } }
      );
      toast.success("Task created");
      setTitle("");
      setAssignedTo("");
      setDeadline("");
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating task");
    }
  };

  // ✅ Update task status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(
        `/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: token } }
      );
      toast.success("Status updated");
      fetchTasks();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // 🗑 Delete task
  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`/tasks/${taskId}`, {
        headers: { Authorization: token },
      });
      toast.success("Task deleted");
      fetchTasks();
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="mt-4">
      {/* ➕ Task Creation Form */}
      <form onSubmit={handleCreate} className="space-y-2 mb-4">
        <input
          type="text"
          placeholder="New Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Assign to (optional)"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Add Task
        </button>
      </form>

      {/* 🔍 Filter by Status */}
      <div className="mb-2">
        <label className="text-sm mr-2 font-medium">Filter:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="All">All</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* 📋 Task List */}
      <ul className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-sm">No tasks yet.</p>
        ) : (
          tasks
            .filter((task) =>
              filterStatus === "All" ? true : task.status === filterStatus
            )
            .map((task) => (
              <li
                key={task._id}
                className="bg-gray-100 p-2 rounded flex justify-between items-center"
              >
                <div>
                  <strong>{task.title}</strong>{" "}
                  <span className="text-sm text-blue-600">
                    ({task.status})
                  </span>

                  {task.assignedTo && (
                    <div className="text-sm text-gray-600">
                      Assigned to:{" "}
                      <span className="font-medium">{task.assignedTo}</span>
                    </div>
                  )}

                  {task.deadline && (
                    <div className="text-sm text-gray-500">
                      📅 Deadline:{" "}
                      {new Date(task.deadline).toLocaleDateString("en-IN")}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* ✅ Status dropdown */}
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task._id, e.target.value)
                    }
                    className="text-sm border rounded px-1 py-0.5"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  {/* 🗑 Delete button */}
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ❌
                  </button>
                </div>
              </li>
            ))
        )}
      </ul>
    </div>
  );
}

export default TaskList;
