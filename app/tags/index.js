const db = require("../../db");

module.exports = {
    renderViewTagsPage: (req, res) => {
        // get all tags -> Victoria
        db.query(
            "SELECT id, description FROM tags ORDER BY description ASC",
            [],
            (err, result) => {
                if (err) {
                    // if unable to query tag description, render page that has all the tags -> Victoria
                    req.flash("error", "Unable to query tags");
                    res.render("tag/show_all"); // redundant ??
                }

                // render page that has all tags -> Victoria
                res.render("tag/show_all", { tags: result.rows });
            }
        );
    },

    renderCreatePage: (req, res) => {
        res.render("tag/new");
    },

    createTag: (req, res) => {
        const { description } = req.body;
        console.log("description:", description);

        // create new tags -> Victoria
        db.query(
            "INSERT INTO tags (description) VALUES ($1)",
            [description],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    // if new tag is unable to be created, redirect to tags page -> Victoria
                    req.flash("error", "Unable to create a new tags.");
                    return res.redirect("/tags");
                }

                // if new tag is created, redirect to admin page -> Victoria
                req.flash("success", "Tag created successfully.");
                return res.redirect("/admin");
            }
        );
    },

    renderViewTagPage: (req, res) => {
        // console.log("Params", req.params);
        let { tag_id } = req.params;
        try {
            tag_id = parseInt(tag_id);
        } catch (error) {
            console.log(error);
            req.flash("error", "Unable to query tag");
            res.redirect("/tags");
        }
        // console.log(typeof tag_id);

        // get specific tag -> Victoria
        db.query(
            "SELECT id, description FROM tags WHERE id=$1",
            [tag_id],
            (err, result) => {
                if (err) {
                    // if tag information can't be queried, then go back to tags -> Victoria
                    req.flash("error", "Unable to query tag");
                    res.redirect("/tags");
                }
                // console.log(result.rows[0]);

                // render the page that has the tag info from DB -> Victoria
                res.render("tag/tag_info", { tag: result.rows[0] });
            }
        );
        // res.redirect("/tags");
    },

    updateTag: (req, res) => {
        let { tag_id } = req.params;
        try {
            tag_id = parseInt(tag_id);
        } catch (error) {
            console.log(error);
            req.flash("error", "Unable to update tag");
            res.redirect(`tags/tag/${tag_id}`);
        }

        const { description } = req.body;

        // update tag -> Victoria
        db.query(
            "UPDATE tags SET description=$1 WHERE id=$2;",
            [description, tag_id],
            (err, result) => {
                if (err) {
                    req.flash("error", `Unable to update tag ${tag_id}`);
                } else {
                    req.flash("success", `Tag ${tag_id} updated successfully.`);
                }

                // redicrt to tags page after every attempt to update tag -> Victoria
                return res.redirect("/tags");
            }
        );
    },

    deleteTag: (req, res) => {
        let { tag_id } = req.params;
        try {
            tag_id = parseInt(tag_id);
        } catch (error) {
            console.log(error);
            req.flash("error", "Unable to update tag");
            res.redirect(`tags/tag/${tag_id}`);
        }

        // delete tag -> Victoria
        db.query("DELETE FROM tags WHERE id=$1;", [tag_id], (err, result) => {
            if (err) {
                req.flash("error", `Unable to delete tag ${tag_id}`);
            } else {
                req.flash("success", `Tag ${tag_id} deleted successfully.`);
            }

            // redicrt to tags page after every attempt to delete tag -> Victoria
            return res.redirect("/tags");
        });
    },
};
