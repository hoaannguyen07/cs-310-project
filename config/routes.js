const {
    isLoggedIn,
    requiresLogin,
    requiresBloggerOrAdmin,
    requiresAdmin,
    requiresBlogCreator,
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
    app.post("/about-me/update", requiresLogin, users.updateAboutMe);
    // user info
    app.get("/users", requiresAdmin, users.renderUserListPage);
    app.get("/users/user/:user_id", requiresAdmin, users.renderUserInfoPage);
    app.post(
        "/users/user/:user_id/update",
        requiresAdmin,
        users.updateUserInfo
    );
    app.post(
        "/users/user/:username/delete",
        requiresAdmin,
        users.deleteUserInfo
    );

    // blogs
    app.get("/home", requiresLogin, blogs.renderHome);
    app.get("/blogs/new", requiresBloggerOrAdmin, blogs.renderCreatePage);
    app.post("/blogs/create", requiresBloggerOrAdmin, blogs.createPost);
    app.get("/blogs/blog/:blog_id", requiresLogin, blogs.showPost);
    app.get("/blogs/blog/:blog_id/edit", requiresBlogCreator, blogs.editPost);
    app.post(
        "/blogs/blog/:blog_id/update",
        requiresBlogCreator,
        blogs.updatePost
    );

    // admin routes
    app.get("/admin", requiresAdmin, admins.renderAdminLanding);

    app.get("/health", monitoring.health(db));

    // tag
    app.get("/tags", requiresAdmin, tags.renderViewTagsPage);
    app.get("/tags/tag/:tag_id", requiresAdmin, tags.renderViewTagPage);
    app.get("/tags/new", requiresAdmin, tags.renderCreatePage);
    app.post("/tags/create", requiresAdmin, tags.createTag);
    app.post("/tags/tag/:tag_id/update", requiresAdmin, tags.updateTag);
    app.post("/tags/tag/:tag_id/delete", requiresAdmin, tags.deleteTag);

    app.get("*", (req, res) => {
        res.sendStatus(404);
    });
};
