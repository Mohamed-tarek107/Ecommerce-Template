const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const accesstoken = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(accesstoken, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const requireAdmin = async (req,res,next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admins only" });
}
    next();
}