const db = require("../../db");

module.exports = {
    renderViewTagsPage: (req, res) => {
        db.query("SELECT id, description FROM tags", [], (err, result) => {
            if (err) {
                req.flash("error", "Unable to query tags");
                res.render("tag/show_all");
            }

            res.render("tag/show_all", { tags: result.rows });
        });
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

    renderViewTagPage: (req, res) => {
        console.log("Params", req.params);
        let { tag_id } = req.params;
        try {
            tag_id = parseInt(tag_id);
        } catch (error) {
            console.log(error);
            req.flash("error", "Unable to query tag");
            res.redirect("/tags");
        }
        console.log(typeof tag_id);

        db.query(
            "SELECT id, description FROM tags WHERE id=$1",
            [tag_id],
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to query tag");
                    res.redirect("/tags");
                }
                console.log(result.rows[0]);
                res.render("tag/tag_info", { tag: result.rows[0] });
            }
        );
        // res.redirect("/tags");
    },
};