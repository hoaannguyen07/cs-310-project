module.exports = {
    renderHome: (req, res) => {
        res.render("home");
    },

    renderCreatePage: (req, res) => {
        res.render("blog/new");
    },

    createPost: (req, res) => {
        console.log(req)

        res.redirect("/blogs/new")
    }
};
