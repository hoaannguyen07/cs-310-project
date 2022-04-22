const db = require("../../db");

module.exports = {
    renderCreatePage: (req, res) => {
        res.render("blog/new");
    },

    createPost: (req, res) => {
        console.log(req.body);
        const { title, body } = req.body;

        /*
        console.log("title:", title);
        console.log("body:", body);
        console.log("user id:", req.user.id);
        */

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

    renderHome: (req, res) => {
        db.query(
            "SELECT id, user_id, title, body, created_at FROM posts ORDER BY created_at DESC",
            [],
            (err, result) => {
                if (err) {
                    console.log("THERES AN ERROR");
                    req.flash("error", "Unable to query tags");
                    res.render("home", { blogs: result.rows });
                }
                res.render("home", { blogs: result.rows });
            }
        );
    },

    showPost: (req, res) => {
        let { blog_id } = req.params;
        console.log(blog_id);
        res.redirect("/home");
    },

    /*
    updatePost: (req, res) => {
        console.log(req.body);
        const { title, body } = req.body;
        console.log("title:", title);
        console.log("body:", body);
        console.log("user id:", req.user.id);

        db.query(
            "UPDATE unapproved_posts SET title= $1, body=$2 WHERE id=$3",
            [title, body, req.user.id],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    req.flash("error", "Unable to update post.");
                    return res.redirect("/blogs/");
                }

                req.flash("success", "Post updated successfully.");
                return res.redirect("/home");
            }
        );
    },*/
};
