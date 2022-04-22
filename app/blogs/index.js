const db = require("../../db");

module.exports = {
    renderCreatePage: (req, res) => {
        res.render("blog/new");
    },

    createPost: (req, res) => {
        const { title, body } = req.body;

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
        const { blog_id } = req.params;

        // get all tags
        db.query(
            "SELECT id, description FROM tags ORDER BY description ASC;",
            [],
            (tags_err, tags_result) => {
                if (tags_err) {
                    req.flash("error", "Unable to edit post.");
                    return res.redirect(`/blogs/blog/${blog_id}`);
                }

                all_tags = tags_result.rows;
                // console.log(all_tags);

                // get info on specific post
                db.query(
                    "SELECT id, title, body FROM posts WHERE id=$1;",
                    [blog_id],
                    (blog_err, blog_result) => {
                        if (blog_err || blog_result.rowCount !== 1) {
                            req.flash("error", "Unable to edit post.");
                            return res.redirect(`/blogs/blog/${blog_id}`);
                        }

                        db.query(
                            "SELECT tags.id, tags.description FROM post_tags INNER JOIN tags ON post_tags.tag_id=tags.id WHERE post_tags.post_id=$1;",
                            [blog_id],
                            (blog_tags_err, blog_tags_result) => {
                                if (blog_tags_err) {
                                    req.flash("error", "Unable to edit post.");
                                    return res.redirect(
                                        `/blogs/blog/${blog_id}`
                                    );
                                }
                                // console.log(blog_tags_result.rows);

                                // add identification on tags that post has
                                all_tags.forEach((tag) => {
                                    tag.check = false;
                                    blog_tags_result.rows.forEach(
                                        (blog_tag) => {
                                            if (tag.id === blog_tag.id) {
                                                tag.check = true;
                                            }
                                        }
                                    );
                                });

                                // console.log(all_tags);
                                res.render("blog/edit", {
                                    blog: blog_result.rows[0],
                                    tags: all_tags,
                                });
                            }
                        );
                    }
                );
            }
        );
    },

    updatePost: (req, res) => {
        console.log(req.params);
        console.log(Object.entries(req.body));
        // console.log(req.body[`tag_${1}`]);

        const { blog_id } = req.params;
        const { title, body } = req.body;

        const tag_id_regex = /tag_[1-9]/;
        const tag_id_selected = [];
        Object.entries(req.body).forEach(([key, value]) => {
            const match_tag_id = key.match(tag_id_regex);
            console.log("Matches: ", match_tag_id);
            if (match_tag_id) {
                tag_id_selected.push(value);
            }
        });

        console.log(tag_id_selected);

        // db.query(
        //     "UPDATE posts SET title=$1, body=$2 WHERE id=$3;",
        //     [title, body, blog_id],
        //     (err, result) => {
        //         if (err || result.rowCount !== 1) {
        //             req.flash("error", "Unable to edit post.");
        //         } else {
        //             req.flash("success", "Successfully edited post.");
        //         }
        //         res.redirect(`/blogs/blog/${blog_id}`);
        //     }
        // );
        return res.redirect(`/blogs/blog/${blog_id}/edit`);
    },

    deletePost: (req, res) => {
        const { blog_id } = req.params;

        db.query("DELETE FROM posts WHERE id=$1;", [blog_id], (err, result) => {
            if (err) {
                req.flash("error", "Unable to delete post.");
            } else {
                req.flash("success", "Successfully deleted post.");
            }
            res.redirect(`/home`);
        });
    },

    upvotePost: (req, res) => {
        const { blog_id } = req.params;

        db.query(
            "UPDATE posts SET num_upvotes=(SELECT num_upvotes FROM posts WHERE id=$1 LIMIT 1)+1 WHERE id=$1;",
            [blog_id],
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to upvote post.");
                } else {
                    req.flash("success", "Successfully upvoted post.");
                }
                res.redirect(`/blogs/blog/${blog_id}`);
            }
        );
    },
};
