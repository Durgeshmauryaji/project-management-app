const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Project = require("../models/Project");

// ✅ Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    console.warn("❌ No token provided");
    return res.status(401).json({ message: "Access denied, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Create a new project
router.post("/", auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const newProject = new Project({
      name,
      description,
      createdBy: req.user.userId,
      members: [], // optional: can be initialized with creator
    });

    await newProject.save();
    console.log("✅ Project created:", newProject.name);
    res.status(201).json(newProject);
  } catch (err) {
    console.error("❌ Project creation error:", err.message);
    res.status(500).json({ message: "Server error while creating project" });
  }
});

// ✅ Get all projects of the logged-in user (created by them)
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find({ createdBy: req.user.userId });
    res.status(200).json(projects);
  } catch (err) {
    console.error("❌ Fetch projects error:", err.message);
    res.status(500).json({ message: "Server error while fetching projects" });
  }
});

// ✅ Get a specific project by ID (only if owner or member)
router.get("/:id", auth, async (req, res) => {
  const projectId = req.params.id;
  console.log("📥 Fetching project by ID:", projectId);

  try {
    const project = await Project.findById(projectId).populate("members", "name email");

    if (!project) {
      console.warn("❌ No project found with ID:", projectId);
      return res.status(404).json({ message: "Project not found" });
    }

    const isOwner = String(project.createdBy) === req.user.userId;
    const isMember = project.members.some(m => String(m._id) === req.user.userId);

    if (!isOwner && !isMember) {
      console.warn("🚫 Unauthorized access to project:", projectId);
      return res.status(403).json({ message: "Access denied to this project" });
    }

    console.log("✅ Project found:", project.name);
    res.status(200).json(project);
  } catch (err) {
    console.error("❌ Fetch single project error:", err.message);
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

// ✅ Add member to project
router.post("/:id/members", auth, async (req, res) => {
  const projectId = req.params.id;
  const { userId } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (String(project.createdBy) !== req.user.userId) {
      return res.status(403).json({ message: "Only the project owner can add members" });
    }

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
      console.log(`✅ Added member ${userId} to project ${project.name}`);
    }

    const updated = await Project.findById(projectId).populate("members", "name email");
    res.status(200).json(updated);
  } catch (err) {
    console.error("❌ Add member error:", err.message);
    res.status(500).json({ message: "Failed to add member" });
  }
});

module.exports = router;
