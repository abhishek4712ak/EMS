import jwt from "jsonwebtoken";

async function verifyAdmin(req, res, next) {
    try {
        const token = req.cookies.admin_token;

        if (!token) {
            return res.status(401).render("admin/admin_login", {
                error: "Please login to access this resource",
            });
        } else {
            const authData = await jwt.verify(token, process.env.JWT_SECRET);
            if (authData.role !== "admin") {
                return res.status(403).render("admin/admin_login", {
                    error: "Access denied",
                });
            }
            req.admin = authData;
            console.log("Admin verified:", authData);
            next();
        }
    } catch (error) {
        console.error("Error verifying admin:", error);
        return res.status(401).redirect("/admin/login");
    }
}

async function isAdminLoggedIn(req, res, next) {
    const token = req.cookies.admin_token;
    if (token) {
        try {
            const authData = await jwt.verify(token, process.env.JWT_SECRET);
            if (authData.role === "admin") {
                res.redirect("/admin/admin_dashboard");
            } else {
                next();
            }
        } catch (error) {
            console.error("Error checking admin login status:", error);
            next();
        }
    } else {
        next();
    }
}

export { verifyAdmin, isAdminLoggedIn };
