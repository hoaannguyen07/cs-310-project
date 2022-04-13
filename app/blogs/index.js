module.exports = {
    renderHome: (req, res) => {
        res.render("home");
    },

    renderCreatePage: (req, res) => {
        res.render("blog/create");
    },
};
