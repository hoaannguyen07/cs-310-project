const db = require("../../db");

module.exports = {
    renderViewTagsPage: (req, res) => {
        // res.render("tag/show_all");
        /*console.log("descrpition:", description);*/
        db.query("SELECT id, description FROM tags", [], (err, result) => {
            if (err) {
                req.flash("error", "Unable to query tags");
                res.render("tag/show_all");
            }

            // console.log(result.rows);
            res.render("tag/show_all", { tags: result.rows });
        });
    },

    renderCreatePage: (req, res) => {
        console.log(req.body);
        res.render("tag/new");
    },

    createTag: (req, res) => {
        console.log(req.body);
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
};
