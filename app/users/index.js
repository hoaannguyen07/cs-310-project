const bcrypt = require("bcryptjs");
const db = require("../../db");

module.exports = {
    renderRegister: (req, res) => {
        res.render("register");
    },

    register: (req, res) => {
        const { username, password } = req.body;
        const user = "user";
        const saltRounds = 10;
        const hash = bcrypt.hashSync(password, saltRounds);

        db.query(
            "INSERT INTO users(username, password, type) VALUES ($1, $2, $3);",
            [username, hash, user],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    req.flash(
                        "error",
                        `Error Registering User. Error Code: ${err.code}`
                    );
                    return res.redirect("/register");
                }

                req.flash("success", `Successfully registered ${username}!`);
                return res.redirect("/login");
            }
        );
    },

    renderLogin: (req, res) => {
        res.render("login");
    },

    login: (req, res) => {
        req.flash("success", "Welcome back!");
        res.redirect("/home");
    },

    logout: (req, res) => {
        req.logout();
        req.flash("success", "Successfully logged out!");
        return res.redirect("/login");
    },

    renderHome: (req, res) => {
        res.render("home");
    },
};
