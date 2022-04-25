const db = require("../../db");

module.exports = {
    // make sure user is not logged in (user exists in passport) (used for logging in & registering) -> Hoa
    isLoggedIn: (req, res, next) => {
        if (req.user) {
            return res.redirect("/home");
        }

        // let the requester continue to the next middleware/page -> Hoa
        return next();
    },

    // make sure user is authenticated already to continue forward -> Hoa
    requiresLogin: (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.session.returnTo = req.originalUrl;
            return res.redirect("/login");
        }

        // let the requester continue to the next middleware/page -> Hoa
        return next();
    },

    // make sure user is admin to move forward -> Hoa
    requiresAdmin: (req, res, next) => {
        if (!req.user || req.user.type != "admin") {
            return res.sendStatus(401);
        }

        // let the requester continue to the next middleware/page -> Hoa
        return next();
    },

    // make sure user is blogger or admin to move forward -> Hoa
    requiresBloggerOrAdmin: (req, res, next) => {
        if (
            !req.user ||
            !(req.user.type === "blogger" || req.user.type === "admin")
        ) {
            return res.sendStatus(401);
        }

        // let the requester continue to the next middleware/page -> Hoa
        return next();
    },

    // requires user to be the created of the blog to continue (for editing blog) -> Hoa
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

                // let the requester continue to the next middleware/page -> Hoa
                return next();
            }
        );
    },

    // make sure user is the creator of the blog or an admin to move forward (for deleting blogs) -> Victoria
    requiresBlogCreatorOrAdmin: (req, res, next) => {
        // if the user already has the status of admin, he/she can already be let through
        if (req.user && req.user.type === "admin") {
            return next();
        }

        // get blog id to see if the id of the blog create matches the id of the current user -> Victoria
        let { blog_id } = req.params;

        db.query(
            "SELECT user_id FROM posts WHERE posts.id = $1;",
            [blog_id],
            (err, result) => {
                if (err) {
                    // if  there are any errors, them redirect to home b/c they don't have the required permissions -> Victoria
                    req.flash("error", "Unauthorized to delete blog");
                    return res.redirect("/home");
                }

                const created_by_id = result.rows[0].user_id;

                // if user id of blog creator is not the same as the current logged in user, then redirect to home as well b/c they don't have the required permissions -> Victoria
                if (req.user.id != parseInt(created_by_id)) {
                    req.flash("error", "Unauthorized to delete blog");
                    return res.redirect("/home");
                }

                // let the requester continue to the next middleware/page -> Victoria
                return next();
            }
        );
    },
};
