module.exports = {
    renderAdminLanding: (req, res) => {
        console.log("rendering admin landing page");
        res.render("admin/admin_landing");
    },
};
