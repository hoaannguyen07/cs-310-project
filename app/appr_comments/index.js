const db = require("../../db");

module.exports = {
    renderApprCommPage: (req, res) => {
        db.query(
            "SELECT * FROM unapproved_comments ORDER BY id ASC",
            [],
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to query tags");
                    res.render("appr_comments/show_all");
                }

                res.render("appr_comm/show_all", { unapproved_comments: result.rows });
            }
        );
    },

    renderCreatePage: (req, res) => {
        res.render("tag/new");
    },

    createTag: (req, res) => {
        const { description } = req.body;
        console.log("description:", description);

        db.query(
            "INSERT INTO tags (description) VALUES ($1)",
            [description],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    req.flash("error", "Unable to create a new tags.");
                    return res.redirect("/tags");
                }

                req.flash("success", "Tag created successfully.");
                return res.redirect("/admin");
            }
        );
    },

    renderUpdateCommPage: (req, res) => {
        // console.log("Params", req.params);
        let { unapproved_comment_id } = req.params;
        try {
            unapproved_comment_id = parseInt(unapproved_comment_id);
        } catch (error) {
            console.log(error);
            req.flash("error", "Unable to query tag");
            res.redirect("/appr_comments");
        }
        // console.log(typeof tag_id);

        db.query(
            "SELECT id, body FROM unapproved_comments WHERE id=$1",
            [unapproved_comment_id],
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to query tag");
                    res.redirect("/appr_comments");
                }
                // console.log(result.rows[0]);
                res.render("appr_comm/comment_info", { unapproved_comment: result.rows[0] });
            }
        );
        // res.redirect("/tags");
    },

    updateComm: (req, res) => {
        let { unapproved_comment_id } = req.params;
        try {
            unapproved_comment_id = parseInt(unapproved_comment_id);
        } catch (error) {
            console.log(error);
            req.flash("error", "Unable to update tag");
            res.redirect(`appr_comments/unapproved_comment/${unapproved_comment_id}`);
        }

        const { description } = req.body;

        db.query(
            "UPDATE unapproved_comments SET body=$1 WHERE id=$2;",
            [description, unapproved_comment_id],
            (err, result) => {
                if (err) {
                    req.flash("error", `Unable to update tag ${unapproved_comment_id}`);
                } else {
                    req.flash("success", `Tag ${unapproved_comment_id} updated successfully.`);
                }

                return res.redirect("/appr_comments");
            }
        );
    },

    deleteComm: (req, res) => {
        let { unapproved_comment_id } = req.params;
        try {
            unapproved_comment_id = parseInt(unapproved_comment_id);
        } catch (error) {
            console.log(error);
            req.flash("error", "Unable to update tag");
            res.redirect(`appr_comments/unapproved_comment/${unapproved_comment_id}`);
        }

        db.query("DELETE FROM unapproved_comments WHERE id=$1;", [unapproved_comment_id], (err, result) => {
            if (err) {
                req.flash("error", `Unable to delete tag ${unapproved_comment_id}`);
            } else {
                req.flash("success", `comment ${unapproved_comment_id} deleted successfully.`);
            }

            return res.redirect("/appr_comments");
        });
    },
};
