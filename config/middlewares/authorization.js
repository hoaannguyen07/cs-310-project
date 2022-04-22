const db = require("../../db");

module.exports = {
    isLoggedIn: (req, res, next) => {
        if (req.user) {
            return res.redirect("/panel");
        }

        return next();
    },

    requiresLogin: (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.session.returnTo = req.originalUrl;
            return res.redirect("/login");
        }

        return next();
    },

    requiresAdmin: (req, res, next) => {
        if (!req.user || req.user.type != "admin") {
            return res.sendStatus(401);
        }

        return next();
    },

    requiresBloggerOrAdmin: (req, res, next) => {
        if (
            !req.user ||
            !(req.user.type === "blogger" || req.user.type === "admin")
        ) {
            return res.sendStatus(401);
        }

        return next();
    },

    requiresBlogCreator: (req, res, next) => {
        let { blog_id } = req.params;

        db.query(
            "SELECT user_id FROM posts WHERE posts.id = $1;",
            [blog_id],
            (err, result) => {
                if (err) {
                    console.log("THERES AN ERROR");
                    req.flash("error", "Unauthorized to edit blog");
                    return res.redirect("/home");
                }

                const created_by_id = result.rows[0].user_id;

                if (req.user.id != parseInt(created_by_id)) {
                    req.flash("error", "Unauthorized to edit blog");
                    return res.redirect("/home");
                }

                return next();
            }
        );
    },

    requiresBlogCreatorOrAdmin: (req, res, next) => {
        if (req.user && req.user.type === "admin") {
            return next();
        }

        let { blog_id } = req.params;

        db.query(
            "SELECT user_id FROM posts WHERE posts.id = $1;",
            [blog_id],
            (err, result) => {
                if (err) {
                    console.log("THERES AN ERROR");
                    req.flash("error", "Unauthorized to delete blog");
                    return res.redirect("/home");
                }

                const created_by_id = result.rows[0].user_id;

                if (req.user.id != parseInt(created_by_id)) {
                    req.flash("error", "Unauthorized to delete blog");
                    return res.redirect("/home");
                }

                return next();
            }
        );
    },
};
