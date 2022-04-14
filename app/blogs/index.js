const db = require("../../db");

module.exports = {
    renderHome: (req, res) => {
        res.render("home");
    },

    renderCreatePage: (req, res) => {
        res.render("blog/new");
    },

    createPost: (req, res) => {
        console.log(req.body);
        const { title, body } = req.body;
        console.log("title:", title);
        console.log("body:", body);
        console.log("user id:", req.user.id);

        db.query(
            "INSERT INTO unapproved_posts (user_id, title, body) VALUES ($1, $2, $3)",
            [req.user.id, title, body],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    req.flash("error", "Unable to create a new post.");
                    return res.redirect("/blogs/new");
                }

                req.flash("success", "Post created successfully.");
                return res.redirect("/home");
            }
        );
    },
};
