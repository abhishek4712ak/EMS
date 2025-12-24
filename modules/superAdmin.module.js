import { Router } from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import flash from "connect-flash";
import { verifySuperAdmin, isSuperAdminLoggedIn } from "../middlewares/superAdmin.middleware.js";


const superAdmin = Router();
superAdmin.use(cookieParser());

// Public: login page
superAdmin.get("/login", isSuperAdminLoggedIn, (req, res) => {
  res.render("superAdmin/superAdmin_login", { error: null });
});

// Public: perform login
superAdmin.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: "superadmin" });
    if (!user){
      return res.status(401).render("superAdmin/superAdmin_login", {
        error: "Invalid email",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .render("superAdmin/superAdmin_login", {
          error: "Invalid password",
        });
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30m"}
    );
    res.cookie("superadmin_token", token, { httpOnly: true });
    return res.redirect("/superadmin/dashboard");
  } catch (error) {
    console.error("superadmin login error", error);
    return res
      .status(500)
      .render("superAdmin/superAdmin_login", { error: "Server error" });
  }
});

// Logout
superAdmin.get("/logout", (req, res) => {
  res.clearCookie("superadmin_token");
  res.redirect("/superadmin/login");
});

// Protected: dashboard
superAdmin.get("/dashboard", verifySuperAdmin, async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const adminsCount = await User.countDocuments({ role: "admin" });
    const superJcCount = await User.countDocuments({ role: "superjc" });
    const eventsCount = await Event.countDocuments();
    const activities = []; // placeholder
    return res.render("superAdmin/superAdmin_dashboard", {
      username: req.superadmin.email,
      usersCount,
      adminsCount,
      superJcCount,
      eventsCount,
      activities,
    });
  } catch (error) {
    console.error("dashboard render error", error);
    return res.status(500).send("Server error");
  }
});

// Manage admins
superAdmin.get("/manage-admin", verifySuperAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("email createdAt")
      .lean();
    const message = req.query.message || null;
    return res.render("superAdmin/manage_admin", {
      username: req.superadmin.email,
      admins,
      message,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

superAdmin.post("/manage-admin",  async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Missing fields");
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.redirect("/superadmin/manage-admin?message=Admin%20already%20exists");
    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new User({ email, password: hashed, role: "admin" });
    await newAdmin.save();
    return res.redirect("/superadmin/manage-admin?message=Admin%20added%20successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

superAdmin.post("/manage-admin/delete",  async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send("Missing id");
  try {
    await User.findByIdAndDelete(id);
    return res.redirect("/superadmin/manage-admin?message=Admin%20deleted%20successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

superAdmin.get(
  "/manage-admin/edit/:id",
  async (req, res) => {
    try {
      const id = req.params.id;
      const admin = await User.findById(id).lean();
      if (!admin) return res.status(404).send("Not found");
      return res.render("superAdmin/edit_admin", {
        username: req.superadmin.email,
        admin,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  }
);

superAdmin.post(
  "/manage-admin/edit/:id",
  async (req, res) => {
    try {
      const id = req.params.id;
      const { email, password } = req.body;
      const update = {};
      if (email) update.email = String(email).trim();
      if (password) update.password = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(id, update);
      return res.redirect("/superadmin/manage-admin");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  }
);

// Manage SuperJC
superAdmin.get("/manage-superjc", async (req, res) => {
  try {
    const superjcs = await User.find({ role: "superjc" })
      .select("email createdAt")
      .lean();
    const message = req.query.message || null;
    return res.render("superAdmin/manage_superjc", {
      superjcs,
      message,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

superAdmin.post("/manage-superjc",  async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Missing fields");
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.redirect("/superadmin/manage-superjc?message=SuperJC%20already%20exists");
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashed, role: "superjc" });
    await newUser.save();
    return res.redirect("/superadmin/manage-superjc?message=SuperJC%20added%20successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

superAdmin.post(
  "/manage-superjc/delete",
  async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).send("Missing id");
    try {
      await User.findByIdAndDelete(id);
      return res.redirect("/superadmin/manage-superjc?message=SuperJC%20deleted%20successfully");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  }
);

superAdmin.get(
  "/manage-superjc/edit/:id",
  async (req, res) => {
    try {
      const id = req.params.id;
      const u = await User.findById(id).lean();
      if (!u) return res.status(404).send("Not found");
      return res.render("superAdmin/edit_superjc", {
        username: req.superadmin.email,
        user: u,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  }
);

superAdmin.post(
  "/manage-superjc/edit/:id",
  async (req, res) => {
    try {
      const id = req.params.id;
      const { email, password } = req.body;
      const update = {};
      if (email) update.email = String(email).trim();
      if (password) update.password = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(id, update);
      return res.redirect("/superadmin/manage-superjc");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  }
);


// Per-event halt management
superAdmin.get("/halt", verifySuperAdmin, async (req, res) => {
  try {
    const events = await Event.find().sort({ event: 1 }).lean();
    const message = req.query.message || null;
    return res.render("superAdmin/halt", {
      username: req.superadmin.email,
      events,
      message,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

superAdmin.post("/halt/toggle/:id",  async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).send("Event not found");
    event.halt = event.halt === 1 ? 0 : 1;
    await event.save();
    return res.redirect("/superadmin/halt?message=" + encodeURIComponent(`Event '${event.event}' is now ${event.halt ? 'Halted' : 'Active'}`));
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

// Events CRUD
superAdmin.get("/addEvents",  async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();
    const message = req.query.message || null;
    return res.render("superAdmin/manage_events", {
      
      events,
      event: null,
      message,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

superAdmin.post("/addEvents",  async (req, res) => {
  const { event, type, venue, time, limit } = req.body;
  if (!event || !type) return res.status(400).send("Missing fields");
  if (!["individual", "team"].includes(type))
    return res.status(400).send("Invalid type");
  const events = await Event.findOne({ event: event.trim() });
  if (events)
    return res.redirect("/superadmin/addEvents?message=Event%20already%20added");
  const limitNum = limit ? Number(limit) : 0;
  if (limit && (isNaN(limitNum) || limitNum < 0))
    return res.status(400).send("Invalid limit");
  const eventData = {
    event: String(event).trim(),
    type: String(type),
    venue: venue ? String(venue).trim() : "",
    time: time ? String(time).trim() : "",
    limit: limitNum,
  };
  try {
  await Event.create(eventData);
  console.log("Event created:", eventData);
  return res.redirect("/superadmin/addEvents?message=Event%20added%20successfully");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

superAdmin.post("/addEvents/delete",  async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send("Missing id");
  try {
    await Event.findByIdAndDelete(id);
    return res.redirect("/superadmin/addEvents");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

superAdmin.get("/addEvents/edit/:id",  async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findById(id).lean();
    if (!event) return res.status(404).send("Not found");
    const events = await Event.find().sort({ date: 1 }).lean();
    return res.render("superAdmin/manage_events", {
      events,
      event,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

superAdmin.post("/addEvents/edit/:id",  async (req, res) => {
  try {
    const id = req.params.id;
    const { event, type, venue, time, limit } = req.body;
    const update = {};
    if (event) update.event = String(event).trim();
    if (type) {
      if (!["individual", "team"].includes(type))
        return res.status(400).send("Invalid type");
      update.type = String(type);
    }
    if (venue) update.venue = String(venue).trim();
    if (time) update.time = String(time).trim();
    if (limit) {
      const limitNum = Number(limit);
      if (isNaN(limitNum) || limitNum < 0)
        return res.status(400).send("Invalid limit");
      update.limit = limitNum;
    }
    await Event.findByIdAndUpdate(id, update, { runValidators: true });
    return res.redirect("/superadmin/addEvents");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});





export default superAdmin;
