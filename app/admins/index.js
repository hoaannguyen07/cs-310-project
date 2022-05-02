const db = require("../../db");

module.exports = {
    renderAdminLanding: (req, res) => {
        res.render("admin/admin_landing");
    },

    // Zach
    // renders the page for admin to manipulate unapproved posts
    renderUnapprovedPostsPage: (req, res) => {
        // queries the database to get all unapproved posts
        db.query(
            "SELECT id, title, body, created_at FROM unapproved_posts ORDER BY created_at DESC",
            [],
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to query unapproved posts");
                    return res.render("admin/admin_post_approval");
                }
                console.log(result.rows)
                return res.render("admin/admin_post_approval", {
                    unapproved_posts: result.rows,
                });
            }
        );
    },

    // Zach
    // insert the post into the post table and delete it from the unapproved post table
    approveUnapprovedPost: (req, res) => {
        let { id } = req.params;
        try {
            id = parseInt(id);
        } catch (error) {
            req.flash("error", "Unable to query id");
            return res.redirect("/admin_post_approval");
        }
        // query to insert from unapproved into post table
        db.query(
            "INSERT INTO posts (user_id, title, body) SELECT user_id, title, body FROM unapproved_posts WHERE id=$1;",
            [id],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    req.flash(
                        "error",
                        `Error Approving Post. Error Code: ${err.code}`
                    );
                }

                req.flash("success", `Successfully approved post ${id}!`);
            },
            // query to delete from unapproved post table
            db.query(
                "DELETE FROM unapproved_posts WHERE id=$1",
                [id],
                (err, result) => {
                    if (err) {
                        req.flash("error", `Unable to delete post ${id}`);
                    } else {
                        req.flash(
                            "success",
                            `Successfully deleted unapproved post from table`
                        );
                    }
                    return res.redirect("/admin_post_approval");
                }
            )
        );

        
    },
    // Zach
    // Delete feature for unapproved post table
    deleteUnapprovedPost: (req, res) => {
        let { id } = req.params;
        try {
            id = parseInt(id);
        } catch (error) {
            req.flash("error", "Unable to query post");
            return res.redirect("/admin_post_approval");
        }
        // Query database for unapproved post by id, and delete
        db.query(
                "DELETE FROM unapproved_posts WHERE id=$1",
                [id],
                (err, result) => {
                    if (err) {
                        req.flash("error", `Unable to delete post ${id}`);
                    } else {
                        req.flash(
                            "success",
                            `Successfully deleted unapproved post from table`
                        );
                    }
                    return res.redirect("/admin_post_approval");
                }
        );

        
    },

    // Zach
    // render edit page for unapproved post
    editUnapprovedPost: (req, res) => {
        // get the unapproved post id from page
        const { id } = req.params;
        // get unapproved post data and send to page
        db.query(
            "SELECT id, user_id, title, body FROM unapproved_posts WHERE id=$1;",
            [id],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    req.flash("error", "Unable to edit post.");
                    return res.redirect("/admin_post_approval");
                }
                res.render("admin/admin_post_edit", {
                    post: result.rows[0],
                });
            }
        );
    },

    // Zach
    // Update feature for unapproved posts
    updateUnapprovedPost: (req, res) => {
        // get passed in through params and form to update post
        const { id } = req.params;
        const { title, body } = req.body;

        // update unapproved post
        db.query(
            "UPDATE unapproved_posts SET title=$1, body=$2 WHERE id=$3;",
            [title, body, id],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    req.flash("error", "Unable to update post.");
                    return res.redirect('/admin_post_approval');
                }
                req.flash(
                    "success",
                    "Successfully updated post."
                );
                return res.redirect('/admin_post_approval');
            }
        );
    },
};
