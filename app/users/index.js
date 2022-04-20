const bcrypt = require("bcryptjs");
const db = require("../../db");

module.exports = {
    renderRegister: (req, res) => {
        res.render("users/register");
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
        return res.render("users/login");
    },

    login: (req, res) => {
        req.flash("success", "Welcome back!");
        return res.redirect("/home");
    },

    logout: (req, res) => {
        req.logout();
        req.flash("success", "Successfully logged out!");
        return res.redirect("/login");
    },

    renderAboutMe: (req, res) => {
        return res.render("about_me/show");
    },

    renderEditAboutMe: (req, res) => {
        return res.render("about_me/edit");
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
                    return res.render("users/show_all");
                }

                return res.render("users/show_all", {
                    users: result.rows,
                });
            }
        );
    },

    renderUserInfoPage: (req, res) => {
        // console.log("Params", req.params);
        let { user_id } = req.params;
        try {
            user_id = parseInt(user_id);
        } catch (error) {
            req.flash("error", "Unable to query user");
            return res.redirect("/users");
        }

        db.query(
            "SELECT id, email, username, type FROM users WHERE id=$1",
            [user_id],
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to query user");
                    return res.redirect("/users");
                }
                return res.render("users/user_info", {
                    user: result.rows[0],
                });
            }
        );
    },

    updateUserInfo: (req, res) => {
        const { email, username, user_type } = req.body;

        db.query(
            "UPDATE users SET type=$1 WHERE username=$2;",
            [user_type, username],
            (err, result) => {
                // failure if there's an error or if anything other than 1 row is
                if (err || result.rowCount != 1) {
                    req.flash(
                        "error",
                        `Error updating ${username}'s  user information`
                    );
                } else {
                    req.flash(
                        "success",
                        `Successfully updated ${username}'s  user information`
                    );
                }

                return res.redirect("/users");
            }
        );
    },

    deleteUserInfo: (req, res) => {
        let { username } = req.params;

        db.query(
            "DELETE FROM users WHERE username=$1",
            [username],
            (err, result) => {
                if (err) {
                    req.flash("error", `Unable to delete user ${username}`);
                } else {
                    req.flash(
                        "success",
                        `Successfully deleted user ${username}`
                    );
                }
                return res.redirect("/users");
            }
        );
    },
};
