const { isLoggedIn, requiresLogin } = require("./middlewares/authorization");
const users = require("../app/users");
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

    app.get("/register", isLoggedIn, users.renderRegister);
    app.post("/register", users.register);

    app.get("/login", isLoggedIn, users.renderLogin);
    app.post(
        "/login",
        passport.authenticate("local", { failureRedirect: "/login" }),
        users.login
    );

    app.get("/logout", users.logout);

    app.get("/home", requiresLogin, users.renderHome);

    app.get("/health", monitoring.health(db));

    app.get("*", (req, res) => {
        res.sendStatus(404);
    });
};
