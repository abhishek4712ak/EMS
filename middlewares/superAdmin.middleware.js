import jwt from "jsonwebtoken";

async function verifySuperAdmin(req, res, next) {
    try {
        const token = req.cookies.superadmin_token;

        if (!token) {
            return res.status(401).render("superAdmin/superAdmin_login", {
                error: "Please login to access this resource",
            });
        } else {
            const authData = await jwt.verify(token, process.env.JWT_SECRET);
            if (authData.role !== "superadmin") {
                return res.status(403).render("superAdmin/superAdmin_login", {
                    error: "Access denied",
                });
            }
            req.superadmin = authData;
            console.log("SuperAdmin verified:", authData);
            next();
        }
    } catch (error) {
        console.error("Error verifying superadmin:", error);
        return res.status(401).redirect("/superadmin/login");
    }
}

async function isSuperAdminLoggedIn(req, res, next) {
    const token = req.cookies.superadmin_token;
    if (token) {
        try {
            const authData = await jwt.verify(token, process.env.JWT_SECRET);
            if (authData.role === "superadmin") {
                res.redirect("/superadmin/dashboard");
            } else {
                next();
            }
        } catch (error) {
            console.error("Error checking superadmin login status:", error);
            next();
        }
    } else {
        next();
    }
}

export { verifySuperAdmin, isSuperAdminLoggedIn };
