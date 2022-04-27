const db = require("../../db");

module.exports = {
    // Victoria
    renderCreatePage: (req, res) => {
        res.render("blog/new");
    },

    

    createPost: (req, res) => {
        // get info from password in form to make the post -> Victoria
        const { title, body } = req.body;

        // create new blog -> Victoria
        db.query(
            "INSERT INTO unapproved_posts (user_id, title, body) VALUES ($1, $2, $3)",
            [req.user.id, title, body],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    // if blog is unable to be created, redirect to create new blog page to let users re-create the blog -> Victoria
                    req.flash("error", "Unable to create a new post.");
                    return res.redirect("/blogs/new");
                }
                // if blog is created successfully, then go to page to show all blogs -> Victoria
                req.flash("success", "Post created successfully.");
                return res.redirect("/home");
            }
        );
    },

    renderHome: (req, res) => {
        // get all blogs -> Victoria
        db.query(
            "SELECT posts.id, users.username as created_by, posts.title, body, num_upvotes FROM posts INNER JOIN users ON users.id = posts.user_id ORDER BY created_at DESC;",
            [],
            (err, result) => {
                if (err) {
                    // check if there are any errors and pass in underfined so front end doesn't try to render the blogs in case of an error -> Victoria
                    req.flash("error", "Unable to query blogs");
                    res.render("home", { blogs: undefined });
                }
                // render the page that has all the blogs and pass in blog info gained from the DB -> Victoria
                res.render("home", { blogs: result.rows });
            }
        );
    },

    showPost: (req, res) => {
        // get blog id from params to query the right post -> Victoria
        let { blog_id } = req.params;

        // show specific post -> Victoria
        db.query(
            "SELECT posts.id, users.username as created_by, posts.title, body, num_upvotes FROM posts INNER JOIN users ON users.id = posts.user_id WHERE posts.id=$1 ORDER BY created_at DESC;",
            [blog_id],
            (blog_err, blog_result) => {
                if (blog_err) {
                    // if blog information can't be queried, then go back to home -> Victoria
                    req.flash("error", "Unable to query blog");
                    return res.redirect("/home");
                }
                // get all tags associated with the post -> Hoa
                db.query(
                    "SELECT tags.id, tags.description FROM post_tags INNER JOIN tags ON post_tags.tag_id=tags.id WHERE post_tags.post_id=$1;",
                    [blog_id],
                    (tags_err, tags_result) => {
                        if (tags_err) {
                            // even if tags cannot be queried, post can still be shown, just with the tags it is associated with -> Hoa
                            req.flash(
                                "error",
                                "Unable to query tags for this blog post"
                            );
                        }
                        // show blog and pass in the blog info along with the tags associated with the blogs -> Victoria & Hoa
                        
                        db.query(
                            "SELECT comments.id, comments.body FROM comments WHERE comments.post_id=$1;",
                            [blog_id],
                            (comm_err, comm_result) => {
                                if (comm_err) {
                                    // even if tags cannot be queried, post can still be shown, just with the tags it is associated with -> Hoa
                                    req.flash(
                                        "error",
                                        "Unable to query commments for this blog post"
                                    );
                                    return res.render("blog/show_blog", {
                                        blog: blog_result.rows[0], // blog info is still there to be rendered -> Victoria
                                        tags: undefined, // make sure that no tags are rendered -> Hoa
                                        comments: undefined,
                                    });
                                }
                                // show blog and pass in the blog info along with the tags associated with the blogs -> Victoria & Hoa
                                return res.render("blog/show_blog", {
                                    blog: blog_result.rows[0],
                                    tags: tags_result.rows,
                                    comments: comm_result.rows,
                                });
                            }
                            
                        );
                    }
                    
                );
            }
        );
    },

    editPost: (req, res) => {
        // get blog id to be used to get the blog that the user wants to update -> Victoria
        const { blog_id } = req.params;

        // get all tags to show all possible tags as options for the post to have -> Hoa
        db.query(
            "SELECT id, description FROM tags ORDER BY description ASC;",
            [],
            (tags_err, tags_result) => {
                if (tags_err) {
                    req.flash("error", "Unable to edit post.");
                    return res.redirect(`/blogs/blog/${blog_id}`);
                }

                all_tags = tags_result.rows;

                // get info on specific post -> Victoria
                db.query(
                    "SELECT id, title, body FROM posts WHERE id=$1;",
                    [blog_id],
                    (blog_err, blog_result) => {
                        if (blog_err || blog_result.rowCount !== 1) {
                            // if can't get post info for the edit post page, then go back to the show post page -> Victoria
                            req.flash("error", "Unable to edit post.");
                            return res.redirect(`/blogs/blog/${blog_id}`);
                        }

                        // get the tags that the user already has for the post to make them checked on the front end by default -> Hoa
                        db.query(
                            "SELECT tags.id, tags.description FROM post_tags INNER JOIN tags ON post_tags.tag_id=tags.id WHERE post_tags.post_id=$1;",
                            [blog_id],
                            (blog_tags_err, blog_tags_result) => {
                                if (blog_tags_err) {
                                    // if can't get tag info associated to post, then post can't be edited, so redirect to page to just show post -> Hoa
                                    req.flash("error", "Unable to edit post.");
                                    return res.redirect(
                                        `/blogs/blog/${blog_id}`
                                    );
                                }

                                // add identification of tags that post has so when tags are rendered, the frontend will know which ones should be defaulted to yes, as they are already associated to the post -> Hoa
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

                                // render the blog edit page, passing in the blog info to be defaulted to and list of all tags and their default checked values -> Hoa
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
        // get passed in through params or form to update blog -> Victoria
        const { blog_id } = req.params;
        const { title, body } = req.body;

        const tag_id_regex = /tag_[0-9]/;
        const tag_id_selected = [];
        Object.entries(req.body).forEach(([key, value]) => {
            const match_tag_id = key.match(tag_id_regex);
            if (match_tag_id) {
                tag_id_selected.push(value);
            }
        });

        // update blog info -> Victoria
        db.query(
            "UPDATE posts SET title=$1, body=$2 WHERE id=$3;",
            [title, body, blog_id],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    // redirect to view blog page in case the updating of the blog didn't go smoothly -> Victoria
                    req.flash("error", "Unable to update post.");
                    return res.redirect(`/blogs/blog/${blog_id}`);
                }

                // delete all tags associated with post & then recreate the tags with the new set of tags -> Hoa
                db.query(
                    "DELETE FROM post_tags WHERE post_id=$1",
                    [blog_id],
                    (delete_blog_tags_err, delete_blog_tags_result) => {
                        if (delete_blog_tags_err) {
                            // redirect to view blog page in case the deletion of tags fails -> Hoa
                            req.flash("error", "Unable to update post.");
                            return res.redirect(`/blogs/blog/${blog_id}`);
                        }

                        // prep query to add in all tags selected to be updated -> Hoa
                        let query = "";
                        tag_id_selected.forEach((tag) => {
                            query += `INSERT INTO post_tags(post_id, tag_id) VALUES ('${blog_id}', '${tag}');`;
                        });

                        // add all selected tags to the blog (post_tags table) -> Hoa
                        db.query(
                            query,
                            [],
                            (insert_blog_tags_err, insert_blog_tags_result) => {
                                if (insert_blog_tags_err) {
                                    // if new set of tags can't be inputted, then redirect to show blog page -> Hoa
                                    req.flash(
                                        "error",
                                        "Unable to update post."
                                    );
                                    return res.redirect(
                                        `/blogs/blog/${blog_id}`
                                    );
                                }

                                // go back to show blog page when everything is successful -> Victoria & Hoa
                                req.flash(
                                    "success",
                                    "Successfully updated post."
                                );
                                return res.redirect(`/blogs/blog/${blog_id}`);
                            }
                        );
                    }
                );
            }
        );
    },

    deletePost: (req, res) => {
        // get passed in through paramsto delete blog -> Victoria
        const { blog_id } = req.params;

        // delete blog -> Victoria
        db.query("DELETE FROM posts WHERE id=$1;", [blog_id], (err, result) => {
            // go back home either way if query is successful but show message of it being successful of not -> Victoria
            if (err) {
                req.flash("error", "Unable to delete post.");
            } else {
                req.flash("success", "Successfully deleted post.");
            }
            res.redirect(`/home`);
        });
    },

    upvotePost: (req, res) => {
        // get passed in through params to upvote a specific blog -> Victoria
        const { blog_id } = req.params;

        // update blog num_upvotes -> Victoria
        db.query(
            "UPDATE posts SET num_upvotes=(SELECT num_upvotes FROM posts WHERE id=$1 LIMIT 1)+1 WHERE id=$1;",
            [blog_id],
            (err, result) => {
                // go back show blog page either way if query is successful but show message of it being successful of not -> Victoria
                if (err) {
                    req.flash("error", "Unable to upvote post.");
                } else {
                    req.flash("success", "Successfully upvoted post.");
                }
                res.redirect(`/blogs/blog/${blog_id}`);
            }
        );
    },

    insertComm2: (req, res) => {
        // get passed in through params to upvote a specific blog -> Victoria
        const { blog_id } = req.params;
        const {description} = req.body;

        // update blog num_upvotes -> Victoria
        db.query(
            "INSERT INTO comments (post_id, body, user_id) VALUES ($1,$2, 2);",
            [blog_id,description],
            (err, result) => {
                // go back show blog page either way if query is successful but show message of it being successful of not -> Victoria
                if (err) {
                    req.flash("error", "Unable to add comment.");
                } else {
                    req.flash("success", "Successfully added comment.");
                }
                res.redirect(`/blogs/blog/${blog_id}`);
            }
        );
    },

    insertComm: (req, res) => {
        const { blog_id } = req.params;
        const { description } = req.body;
        
        console.log("blod_id:", blog_id);
        console.log("description:", description);
        // get info from password in form to make the post -> Victoria
        // const { body } = req.body;

        // create new blog -> Victoria
        db.query(
            "INSERT INTO unapproved_comments (post_id, body, user_id) VALUES ($1, $2, $3)",
            [blog_id,description,req.user.id],
            (err, result) => {
                if (err) {
                    // if blog is unable to be created, redirect to create new blog page to let users re-create the blog -> Victoria
                    req.flash("error", "Unable to create a new comment.");
                    return res.redirect("/blogs/new");
                }
                // if blog is created successfully, then go to page to show all blogs -> Victoria
                req.flash("success", "comment created successfully.");
                return res.redirect("/home");
            }
        );
    },

    deleteComm: (req, res) => {
        // get passed in through paramsto delete blog -> Victoria
        const { comment_id } = req.params;

        // delete blog -> Victoria
        db.query("DELETE FROM comments WHERE id=$1;", [comment_id], (err, result) => {
            // go back home either way if query is successful but show message of it being successful of not -> Victoria
            if (err) {
                req.flash("error", "Unable to delete comment.");
            } else {
                req.flash("success", "Successfully deleted comment.");
            }
            res.redirect(`/home`);
        });
    },
};
