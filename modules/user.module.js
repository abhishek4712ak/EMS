import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { sendOtpMail, sendWelcomeMail } from "../utils/nodemailer.js";
import participate from "../models/participate.js";
import Count from "../models/count.js";
import students from "../models/students.model.js";
import individualEvents from "../models/individualEvents.js";
import teamEvents from "../models/teamEvents.js";
import { verifyUser, isUserLoggedIn } from "../middlewares/user.middleware.js";
const individualEventsModel = individualEvents;
const teamEventsModel = teamEvents;

const router = express.Router();

router.get("/signup", isUserLoggedIn, (req, res) => {
  res.render("user/userSignup", { error: null });
});

router.post("/send-otp", isUserLoggedIn, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render("user/userSignup", {
      error: "Email and password required.",
    });
  }
  const passRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,}$/;
  if (!passRegex.test(password)) {
    return res.render("user/userSignup", {
      error:
        "Password must be at least 6 characters, include 1 uppercase and 1 special character.",
    });
  }
  if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.render("user/userSignup", { error: "Invalid email format." });
  }
  const existing = await participate.findOne({ email });
  if (existing) {
    return res.render("user/userSignup", {
      error: "Email already registered.",
    });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  if (!req.session) req.session = {};
  req.session.pendingUser = { email, password, otp };
  const mailSent = await sendOtpMail(email, otp);
  if (!mailSent) {
    return res.render("user/userSignup", {
      error: "Failed to send OTP email. Check SMTP settings.",
    });
  }
  res.render("user/enterOtp", { email, error: null });
});

router.post("/verify-otp", isUserLoggedIn, async (req, res) => {
  const { email, otp } = req.body;
  if (!req.session || !req.session.pendingUser) {
    return res.render("user/userSignup", {
      email,
      error: "Session expired. Please register again.",
    });
  }
  const pending = req.session.pendingUser;
  if (pending.email !== email) {
    return res.render("user/signup", { email, error: "Email mismatch." });
  }
  if (pending.otp !== otp) {
    return res.render("user/enterOtp", { email, error: "Invalid OTP." });
  }
  const hashed = await bcrypt.hash(pending.password, 10);
  const user = new participate({ email, password: hashed, isVerified: true });
  await user.save();
  req.session.pendingUser = null;
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1h" }
  );
  res.cookie("user_token", token, { httpOnly: true });
  res.redirect("/user/dashboard");
  try {
    await sendWelcomeMail(email);
    console.log(`Welcome email sent to ${email}`);
  } catch (err) {
    console.error(`Failed to send welcome email to ${email}:`, err);
  }
});

router.get("/login", isUserLoggedIn, (req, res) => {
  res.render("user/userLogin", { error: null });
});

router.post("/login", isUserLoggedIn, async (req, res) => {
  const { email, password } = req.body;
  const user = await participate.findOne({ email });
  if (!user) {
    return res.render("user/userLogin", { error: "User not found." });
  }
  if (!user.isVerified) {
    return res.render("user/userLogin", {
      error: "Email not verified. Please register and verify OTP.",
    });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.render("user/userLogin", { error: "Incorrect password." });
  }
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "30m" }
  );
  await res.cookie("user_token", token, { httpOnly: true });
  res.redirect("/user/profile");
});

const getLastCount = async (req, res) => {
  try {
    const count1 = await Count.findOne({ name: "studentsCount" });
    if (count1) {
      const lastValue = count1.count;
      console.log("last value in getlast ", lastValue);
      return lastValue;
    } else {
      return false;
      console.log("No count document found");
    }
  } catch (error) {
    console.log("error in getlast ", error);
  }
};

const getNextCount = async () => {
  try {
    const countDoc = await Count.findOneAndUpdate(
      { name: "lastCount" },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    return countDoc.count;
  } catch (error) {
    console.error("Error getting next count:", error);
    return 1;
  }
};

router.get("/profile", verifyUser, async (req, res) => {
  const user = await participate.findById(req.user.id);
  if (!user) return res.redirect("/user/login");
  const student = await students.findOne({ email: user.email });
  const isEdit = req.query.edit === "true";
  res.render("user/userProfile", {
    email: user.email,
    student: student,
    error: null,
    isEdit: isEdit,
  });
});

router.get("/dashboard", verifyUser, async (req, res) => {
  const user = await participate.findById(req.user.id);
  if (!user) return res.redirect("/user/login");
  const student = await students.findOne({ email: user.email });
  const pid = student ? student.pid : "Not Assigned";
  const isVerified = student ? student.verified : 0;
  res.render("user/userDashboard", {
    email: user.email,
    pid: pid,
    isVerified: isVerified,
  });
});

router.post("/update-profile", verifyUser, async (req, res) => {
  try {
    const emailToken = req.user.email;
    console.log("Updating profile for email:", emailToken);

    const lastCount = await getLastCount();
    console.log("Last Count", lastCount);

    const pid = "P" + Number(lastCount);

    // Trim data to remove spaces
    const email = emailToken.trim();
    const rollno = req.body.rollno.trim();
    const name = req.body.name.trim();
    const phone = req.body.phone.trim();
    const address = req.body.address.trim();
    const gender = req.body.gender;
    const accommodation = req.body.accommodation;
    const college = req.body.college;
    const branch = req.body.branch;
    const year = req.body.year;

    console.log(
      email,
      rollno,
      pid,
      name,
      phone,
      address,
      college,
      branch,
      year
    );

    const alreadyRegistered = await students.findOne({ email: email });

    if (alreadyRegistered && email === emailToken) {
      const updatedStudent = await students.findOneAndUpdate(
        { email: email },
        {
          rollno,
          name,
          phone,
          address,
          college,
          branch,
          year,
          gender,
          accommodation,
        },
        { new: true, upsert: true }
      );

      if (updatedStudent) {
        console.log("Student profile updated:", updatedStudent);
        return res.redirect("/user/profile");
      } else {
        console.error("Failed to update student profile.");
        return res.render("user/userProfile", {
          email,
          student: null,
          error: "Failed to update profile.",
        });
      }
    }

    const existingRollno = await students.findOne({ rollno: rollno });
    if (existingRollno) {
      return res.render("user/userProfile", {
        email,
        student: null,
        error: "Roll Number already registered.",
      });
    }

    const newStudent = new students({
      email,
      pid,
      rollno,
      name,
      phone,
      address,
      college,
      branch,
      year,
      gender,
      accommodation,
    });
    await newStudent.save();
    console.log("New student profile created:", newStudent);
    res.redirect("/user/profile");
  } catch (err) {
    console.error("Error updating profile:", err);
    res.render("user/userProfile", {
      email: null,
      student: null,
      error: "Error updating profile.",
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("user_token");
  res.redirect("/user/login");
});

// Event Modules

router.get("/participation", verifyUser, async (req, res) => {
  try {
    const user = await participate.findById(req.user.id);
    if (!user) return res.redirect("/user/login");
    // Fetch available events
    const Event = (await import("../models/event.model.js")).default;
    const individualEvents = await Event.find({ type: "individual", halt: 0 });
    const teamEvents = await Event.find({ type: "team", halt: 0 });

    const student = await students.findOne({ email: user.email });
    const pid = student ? student.pid : null;
    const participatedIndividual = pid
      ? await individualEventsModel.findOne({ pid: pid })
      : null;
    const participatedEvents = participatedIndividual
      ? participatedIndividual.events
      : [];

    // Fetch participated individual events with details
    const participatedIndividualEvents = [];
    if (participatedIndividual) {
      for (const eventName of participatedIndividual.events) {
        const eventDetails = await Event.findOne({ event: eventName, type: "individual" });
        if (eventDetails) participatedIndividualEvents.push(eventDetails);
      }
    }

    // Fetch participated team events with details
    const participatedTeamEventsRaw = pid ? await teamEventsModel.find({ created_by: pid }) : [];
    const participatedTeamEvents = [];
    for (const teamEvent of participatedTeamEventsRaw) {
      const eventDetails = await Event.findOne({ event: teamEvent.event, type: "team" });
      if (eventDetails) {
        participatedTeamEvents.push({
          ...eventDetails.toObject(),
          teamMembers: teamEvent.temp_members,
          tid: teamEvent.tid
        });
      }
    }

    res.render("user/participation", {
      individualEvents,
      teamEvents,
      participatedEvents,
      participatedIndividualEvents,
      participatedTeamEvents,
      email: user.email,
    });
  } catch (err) {
    console.error("Error fetching participation data:", err);
    res.redirect("/user/dashboard");
  }
});

// POST route for participating in individual events
router.post("/participate/individual", verifyUser, async (req, res) => {
  try {
    const user = await participate.findById(req.user.id);
    if (!user) return res.redirect("/user/login");

    const { eventName } = req.body;
    if (!eventName) {
      return res.status(400).json({ message: "Event name required." });
    }

    const student = await students.findOne({ email: user.email });
    if (!student || !student.pid) {
      return res
        .status(400)
        .json({ message: "Student profile not found or PID not assigned." });
    }

    let userParticipation = await individualEventsModel.findOne({
      pid: student.pid,
    });
    if (!userParticipation) {
      userParticipation = new individualEventsModel({
        pid: student.pid,
        email: user.email,
        events: [],
      });
    }

    if (!userParticipation.events.includes(eventName)) {
      userParticipation.events.push(eventName);
      await userParticipation.save();
    }

    res.redirect("/user/participation");
  } catch (err) {
    console.error("Error participating in individual event:", err);
    res.redirect("/user/participation");
  }
});

// POST route for participating in team events
router.post("/participate/team", verifyUser, async (req, res) => {
  try {
    const user = await participate.findById(req.user.id);
    if (!user) return res.redirect("/user/login");
    const { eventName, teamMembers } = req.body;
    if (!eventName || !teamMembers) {
      return res
        .status(400)
        .json({ message: "Event name and team members required." });
    }

    const memberPIDs = teamMembers
      .split(",")
      .map((pid) => pid.trim())
      .filter((pid) => pid);

    const student = await students.findOne({ email: user.email });
    if (!student || !student.pid) {
      return res
        .status(400)
        .json({ message: "Student profile not found or PID not assigned." });
    }
    if (!memberPIDs.includes(student.pid)) {
      memberPIDs.push(student.pid);
    }
    let userTeamParticipation = await teamEventsModel.findOne({
      created_by: student.pid,
      event: eventName,
    });
    if (!userTeamParticipation) {
      const lastCount1 = await getNextCount();
      console.log("Last Count", lastCount1);

      const tid = "T" + Number(lastCount1)
      userTeamParticipation = new teamEventsModel({
        created_by: student.pid,
        tid: tid,
        event: eventName,
        temp_members: memberPIDs,
        actual_members: [],
      });
      await userTeamParticipation.save();
    }
    res.redirect("/user/participation");
  } catch (err) {
    console.error("Error participating in team event:", err);
    res.redirect("/user/participation");
  }
});

export default router;
