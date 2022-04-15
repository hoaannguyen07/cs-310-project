const {
    isLoggedIn,
    requiresLogin,
    requiresBloggerOrAdmin,
    requiresAdmin,
} = require("./middlewares/authorization");
const blogs = require("../app/blogs");
const admins = require("../app/admins");
const users = require("../app/users");
const tags = require("../app/tags");
const monitoring = require("../app/monitoring");

module.exports = (app, passport, db) => {
    app.use((req, res, next) => {
        res.locals.currentUser = req.user;
        res.locals.error = req.flash("error");
        res.locals.success = req.flash("success");
        next();
    });

    app.get("/", (req, res) => {
        res.render("landing");
    });

    // Hoa Nguyen
    // register
    app.get("/register", isLoggedIn, users.renderRegister);
    app.post("/register", users.register);
    // login
    app.get("/login", isLoggedIn, users.renderLogin);
    app.post(
        "/login",
        passport.authenticate("local", { failureRedirect: "/login" }),
        users.login
    );
    // logout
    app.get("/logout", users.logout);
    // about me
    app.get("/about-me", requiresLogin, users.renderAboutMe);
    app.get("/about-me/edit", requiresLogin, users.renderEditAboutMe);

    // blogs
    app.get("/home", requiresLogin, blogs.renderHome);
    app.get("/blogs/new", requiresBloggerOrAdmin, blogs.renderCreatePage);
    app.post("/blogs/create", requiresBloggerOrAdmin, blogs.createPost);

    // admin routes
    app.get("/admin", requiresAdmin, admins.renderAdminLanding);

    app.get("/health", monitoring.health(db));

    // tag
    app.get("/tags", requiresAdmin, tags.renderViewTagsPage);
    app.get("/tags/new", requiresAdmin, tags.renderCreatePage);
    app.post("/tags/create", requiresAdmin, tags.createTag);

    app.get("*", (req, res) => {
        res.sendStatus(404);
    });
};
