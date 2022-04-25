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
            "INSERT INTO posts SELECT * FROM unapproved_posts WHERE id=$1;",
            [id],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    req.flash(
                        "error",
                        `Error Approving Post. Error Code: ${err.code}`
                    );
                }

                req.flash("success", `Successfully approved post ${id}!`);
            }
        );

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
};
