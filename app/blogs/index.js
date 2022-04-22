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
            "SELECT posts.id, users.username as created_by, posts.title, body, num_upvotes FROM posts INNER JOIN users ON users.id = posts.user_id ORDER BY created_at DESC;",
            [],
            (err, result) => {
                if (err) {
                    console.log("THERES AN ERROR");
                    req.flash("error", "Unable to query blogs");
                    res.render("home", { blogs: result.rows });
                }
                res.render("home", { blogs: result.rows });
            }
        );
    },

    showPost: (req, res) => {
        let { blog_id } = req.params;
        console.log(blog_id);

        db.query(
            "SELECT posts.id, users.username as created_by, posts.title, body, num_upvotes FROM posts INNER JOIN users ON users.id = posts.user_id WHERE posts.id=$1 ORDER BY created_at DESC;",
            [blog_id],
            (err, result) => {
                if (err) {
                    console.log("THERES AN ERROR");
                    req.flash("error", "Unable to query blog");
                    res.redirect("/home");
                }
                res.render("blog/show_blog", { blog: result.rows[0] });
            }
        );
    },

    editPost: (req, res) => {
        console.log(req.body);
        const { blog_id } = req.params;

        db.query(
            "SELECT id, title, body FROM posts WHERE id=$1;",
            [blog_id],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    req.flash("error", "Unable to edit post.");
                    return res.redirect(`/blogs/blog/${blog_id}`);
                }
                res.render("blog/edit", { blog: result.rows[0] });
            }
        );
    },
};
