const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const jwt = require("jsonwebtoken");

// ✅ Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ➕ Create Task
router.post("/", auth, async (req, res) => {
  const { title, status, projectId, assignedTo, deadline } = req.body;
  if (!title || !projectId)
    return res.status(400).json({ message: "Title & Project ID required" });

  try {
    const newTask = await Task.create({
      title,
      status,
      projectId,
      assignedTo,
      deadline,
    });
    res.status(201).json(newTask);
  } catch (err) {
    console.error("❌ Task creation error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// 📄 Get Tasks for a project
router.get("/:projectId", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId });
    res.json(tasks);
  } catch (err) {
    console.error("❌ Fetch task error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update Task status
router.patch("/:taskId", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    console.error("❌ Status update error:", err.message);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// 🗑 Delete Task
router.delete("/:taskId", auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("❌ Task delete error:", err.message);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;
