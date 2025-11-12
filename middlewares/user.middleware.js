import jwt from "jsonwebtoken";

async function verifyUser(req, res, next) {
    try{
        const token = req.cookies.user_token;

        if(!token){
            return res.status(401).render("user/userLogin", {
                error: "Please login to access this resource",
            });
        }
        else{
            const authData = await jwt.verify(token, process.env.JWT_SECRET);
            req.user = authData;
            console.log("User verified:", authData);
            next();
        }
    } catch (error) {
        console.error("Error verifying user:", error);
        return res.status(401).redirect("/user/login");
    }
}

async function isUserLoggedIn(req, res, next) {
    const token = req.cookies.user_token;
    if (token) {
        try {
            const authData = await jwt.verify(token, process.env.JWT_SECRET,(err,decoded)=>{
                if(!err){
                    res.redirect("/user/profile");
                } else {
                    next();
                }
            });
        } catch (error) {
            console.error("Error checking user login status:", error);
            next();
        }
    } else {
        next();
    }
}

export { verifyUser, isUserLoggedIn };