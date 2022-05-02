const {
    isLoggedIn,
    requiresLogin,
    requiresBloggerOrAdmin,
    requiresAdmin,
    requiresBlogCreator,
    requiresBlogCreatorOrAdmin,
} = require("./middlewares/authorization");
const blogs = require("../app/blogs");
const admins = require("../app/admins");
const users = require("../app/users");
const tags = require("../app/tags");
const monitoring = require("../app/monitoring");
const appr_comments = require("../app/appr_comments");

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
    // user info on the admin side
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

    // Victoria, Aaron, and Hoa
    // blogs (with post tags and comments)
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
    app.post(
        "/blogs/blog/:blog_id/delete",
        requiresBlogCreatorOrAdmin,
        blogs.deletePost
    );
    app.post("/blogs/blog/:blog_id/upvote", requiresLogin, blogs.upvotePost);

    // COMMENTS ADDITIONS FROM AARON WEAST
    
    app.get(
        "/blogs/blog/:comment_id/editComm",
        requiresBloggerOrAdmin,
        blogs.renderEditCommPage
    );
    app.post(
        "/blogs/blog/:blog_id/insert",
        requiresBloggerOrAdmin,
        blogs.insertComm
    );
    app.post(
        "/blogs/blog/:comment_id/editComm2",
        requiresBloggerOrAdmin,
        blogs.updateComm
    );
    app.post(
        "/blogs/blog/:comment_id/deleteComm",
        requiresBlogCreatorOrAdmin,
        blogs.deleteComm
    );

    // Hoa
    // admin routes
    app.get("/admin", requiresAdmin, admins.renderAdminLanding);

    // post approval
    app.get(
        "/admin_post_approval",
        requiresAdmin,
        admins.renderUnapprovedPostsPage
    );
    app.get(
        "/admin_post_approval/unapproved_post/:id/edit",
        requiresAdmin,
        admins.editUnapprovedPost
    );
    app.post(
        "/admin_post_approval/unapproved_post/:id/approve",
        requiresAdmin,
        admins.approveUnapprovedPost
    );
    app.post(
        "/admin_post_approval/unapproved_post/:id/delete",
        requiresAdmin,
        admins.deleteUnapprovedPost
    );
    app.post(
        "/admin_post_approval/unapproved_post/:id/update",
        requiresAdmin,
        admins.updateUnapprovedPost
    );

    app.get("/health", monitoring.health(db));

    // Victoria
    // tag
    app.get("/tags", requiresAdmin, tags.renderViewTagsPage);
    app.get("/tags/tag/:tag_id", requiresAdmin, tags.renderViewTagPage);
    app.get("/tags/new", requiresAdmin, tags.renderCreatePage);
    app.post("/tags/create", requiresAdmin, tags.createTag);
    app.post("/tags/tag/:tag_id/update", requiresAdmin, tags.updateTag);
    app.post("/tags/tag/:tag_id/delete", requiresAdmin, tags.deleteTag);

    // appr_comments
    // THESE ROUTES ARE DONE BY AARON WEAST REFERING TO THE UNAPPROVED COMMENTS PAGE
    app.get("/appr_comments", requiresAdmin, appr_comments.renderApprCommPage);
    app.get("/appr_comments/unapproved_comment/:unapproved_comment_id", requiresAdmin, appr_comments.renderUpdateCommPage);
    
    app.post("/appr_comments/unapproved_comment/:unapproved_comment_id/create", requiresAdmin, appr_comments.approveComm);
    app.post("/appr_comments/unapproved_comment/:unapproved_comment_id/update", requiresAdmin, appr_comments.updateComm);
    app.post("/appr_comments/unapproved_comment/:unapproved_comment_id/delete", requiresAdmin, appr_comments.deleteComm);

    app.get("*", (req, res) => {
        res.sendStatus(404);
    });
};
