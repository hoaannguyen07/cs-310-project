const db = require("../../db");

module.exports = {
    renderAdminLanding: (req, res) => {
        res.render("admin/admin_landing");
    },

    renderUnapprovedPostsPage: (req, res) => {
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

    approveUnapprovedPost: (req, res) => {
        let { id } = req.params;
        try {
            id = parseInt(id);
        } catch (error) {
            req.flash("error", "Unable to query post");
            return res.redirect("/admin_post_approval");
        }
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
    deleteUnapprovedPost: (req, res) => {
        let { id } = req.params;
        try {
            id = parseInt(id);
        } catch (error) {
            req.flash("error", "Unable to query post");
            return res.redirect("/admin_post_approval");
        }
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
    editUnapprovedPost: (req, res) => {
        // get blog id to be used to get the blog that the user wants to update -> Victoria
        const { id } = req.params;

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
    updateUnapprovedPost: (req, res) => {
        // get passed in through params or form to update blog -> Victoria
        const { id } = req.params;
        const { title, body } = req.body;

        // update blog info -> Victoria
        db.query(
            "UPDATE unapproved_posts SET title=$1, body=$2 WHERE id=$3;",
            [title, body, id],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    // redirect to view blog page in case the updating of the blog didn't go smoothly -> Victoria
                    req.flash("error", "Unable to update post.");
                    return res.redirect('/admin_post_approval');
                }
                // go back to show blog page when everything is successful -> Victoria & Hoa
                req.flash(
                    "success",
                    "Successfully updated post."
                );
                return res.redirect('/admin_post_approval');
            }
        );
    },
};
