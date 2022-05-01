const db = require("../../db");

// THESE FUNCTIONS DONE BY AARON WEAST REFERING TO THE UNAPPROVED COMMENTS PAGE
module.exports = {
    renderApprCommPage: (req, res) => {
        // THIS FUNCTION RENDERES THE UNAPPROVED COMMENTS PAGE
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

    

    approveComm: (req, res) => {
        // THIS FUNCTION APPROVES THE COMMENT WHICH INSERTS INTO THE COMMENTS
        // TABLE AND DELETES FROM THIS TABLE
        let { unapproved_comment_id } = req.params;
        console.log(unapproved_comment_id);
        try {
            unapproved_comment_id = parseInt(unapproved_comment_id);
        } catch (error) {
            console.log(error);
            req.flash("error", "Unable to query tag");
            res.redirect("/appr_comments");
        }
        

        db.query(
            "INSERT INTO comments (post_id, body, user_id) SELECT post_id, body, user_id FROM unapproved_comments WHERE id=$1;",
            [unapproved_comment_id],
            
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to insert comment.");
                    // return res.redirect("/appr_comments");
                }

                req.flash("success", "comment added successfully.");
                // return res.redirect("/appr_comments");
                
            }
            ,db.query(
                "DELETE FROM unapproved_comments WHERE id=$1",
                [unapproved_comment_id],
                (err, result) => {
                    if (err) {
                        req.flash("error", "Unable to delete comment.");
                        return res.redirect("/appr_comments");
                    }
    
                    req.flash("success", "comment deleted successfully.");
                    return res.redirect("/appr_comments");
                }
            )
        );
    },

    renderUpdateCommPage: (req, res) => {
        // THIS FUNCTION RENDERS THE PAGE TO UPDATE THE COMMENT
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
        // THIS FUNCTION UPDATES THE UNAPPROVED COMMENT TO WHAT THE USER INPUTTED
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
        // THIS FUNCTION DELETES THE COMMENT IF NOT APPROVED
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
