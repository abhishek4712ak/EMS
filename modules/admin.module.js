import {Router} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import cookieParser from "cookie-parser";
import students from "../models/students.model.js";
import { verifyAdmin, isAdminLoggedIn } from "../middlewares/admin.middleware.js";

const Admin = Router();

Admin.use(cookieParser());



Admin.get("/login", isAdminLoggedIn, (req, res) => {
    res.render("admin/admin_login", { error: null });
});




// View all registered students
Admin.get("/students/all", verifyAdmin, async (req, res) => {
    try {
        const studentsList = await students.find();
        res.render("admin/student_list", { students: studentsList, tab: "all" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch students");
    }
});

// View verified students
Admin.get("/students/verified", verifyAdmin, async (req, res) => {
    try {
        const studentsList = await students.find({ verified: 1 });
        res.render("admin/student_list", { students: studentsList, tab: "verified" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch students");
    }
});

// View unverified students
Admin.get("/students/unverified", verifyAdmin, async (req, res) => {
    try {
        const studentsList = await students.find({ verified: 0 });
        res.render("admin/student_list", { students: studentsList, tab: "unverified" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch students");
    }
});
// Show all students with verify/unverify actions



Admin.get("/admin_dashboard", verifyAdmin, async (req, res) => {
    try {
        // Fetch registered students count
        const registeredCount = await students.countDocuments();
        const verifiedCount = await students.countDocuments({ verified: 1 });
        const unverifiedCount = await students.countDocuments({verified: 0});
        res.render("admin/admin_dashboard", {
            username: req.admin.email,
            registeredCount,
            verifiedCount,
            unverifiedCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to fetch dashboard data");
    }
});


Admin.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, role: "admin" });

        if (!user) {
            
            return res.status(400).render("admin/admin_login",{error:"User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).render("admin/admin_login", { error: "Invalid password" });
        }
        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
    res.cookie("admin_token", token, { httpOnly: true });
    // Option 1: Pass username via query string
    // return res.redirect(`/admin/admin_dashboard?username=${encodeURIComponent(user.email)}`);
    // Option 2: Just redirect, username will be fetched from token in dashboard route
    return res.redirect("/admin/admin_dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).render("admin/admin_login", { error: "Server error" });
    }
});


// Verify a student
Admin.post("/admin/verify", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        await students.findByIdAndUpdate(id, { verified: true });
        res.redirect("/admin/students/all");
    } catch (error) {
        console.error(error);
        res.status(500).send("Verification failed");
    }
});

// Unverify a student
Admin.post("/admin/unverify", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        await students.findByIdAndUpdate(id, { verified: false });
        res.redirect("/admin/students/all");
    } catch (error) {
        console.error(error);
        res.status(500).send("Unverification failed");
    }
});

// Logout route
Admin.get("/logout", (req, res) => {
    res.clearCookie("admin_token");
    res.redirect("/admin/login");
});


Admin.post("/student/verify", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        await students.findByIdAndUpdate(id, { verified: 1 });
        res.redirect("/admin/students/verified");
    } catch (error) {
        console.error(error);
        res.status(500).send("Verification failed");
    }
});

Admin.post("/student/unverify", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.body;
        await students.findByIdAndUpdate(id, { verified: 0 });
        res.redirect("/admin/students/unverified");
    } catch (error) {
        console.error(error);
        res.status(500).send("Unverification failed");
    }
});


Admin.get("/students/search", verifyAdmin, async (req, res) => {
    try {
        const { query } = req.query;
        const studentsList = await students.find({
            $or: [
                { email: { $regex: query, $options: "i" } },
                { rollno: { $regex: query, $options: "i" } },
                { pid: { $regex: query, $options: "i" } }
            ]
        });
        res.render("admin/student_list", { students: studentsList, tab: "search" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Search failed");
    }
});



export default Admin;