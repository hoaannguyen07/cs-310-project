const bcrypt = require("bcryptjs");
const db = require("../../db");

module.exports = {
    renderRegister: (req, res) => {
        res.render("register");
    },

    register: (req, res) => {
        const { email, username, password } = req.body;
        const user = "user";
        const saltRounds = 10;
        const hash = bcrypt.hashSync(password, saltRounds);

        db.query(
            "INSERT INTO users(email, username, password, type) VALUES ($1, $2, $3, $4);",
            [email, username, hash, user],
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

    renderAboutMe: (req, res) => {
        res.render("about_me/show");
    },

    renderEditAboutMe: (req, res) => {
        res.render("about_me/edit");
    },

    updateAboutMe: (req, res) => {
        const { email, username, user_type } = req.body;

        db.query(
            "UPDATE users SET email=$1 WHERE username=$2;",
            [email, username],
            (err, result) => {
                // failure if there's an error or if anything other than 1 row is
                if (err || result.rowCount != 1) {
                    req.flash("error", "Error updating user information");
                    return res.redirect("/about-me/edit");
                }

                req.flash("success", "Successfully updated user information");
                return res.redirect("/about-me");
            }
        );
    },

    renderUserListPage: (req, res) => {
        db.query(
            "SELECT id, email, username, type FROM users ORDER BY type ASC",
            [],
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to query users");
                    res.render("admin/users/show_all");
                }

                res.render("admin/users/show_all", { users: result.rows });
            }
        );
    },
};
