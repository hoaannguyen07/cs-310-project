const bcrypt = require("bcryptjs");
const db = require("../../db");

module.exports = {
    // Hoa
    renderRegister: (req, res) => {
        res.render("users/register");
    },

    register: (req, res) => {
        // Get user info to create account from form info that was passed through -> Hoa
        const { email, username, password } = req.body;
        const user = "user"; // everyone will have user type "user" by default on account creation -> Hoa
        const saltRounds = 10;
        const hash = bcrypt.hashSync(password, saltRounds);

        // insert user into db to register the user -> Hoa
        db.query(
            "INSERT INTO users(email, username, password, type) VALUES ($1, $2, $3, $4);",
            [email, username, hash, user],
            (err, result) => {
                if (err || result.rowCount !== 1) {
                    // let people register again if there's been an error with their registration -> Hoa
                    req.flash(
                        "error",
                        `Error Registering User. Error Code: ${err.code}`
                    );
                    return res.redirect("/register");
                }

                // lead user to the login page so they can login with their newly created credentials -> Hoa
                req.flash("success", `Successfully registered ${username}!`);
                return res.redirect("/login");
            }
        );
    },

    // Hoa
    renderLogin: (req, res) => {
        return res.render("users/login");
    },

    // Hoa
    login: (req, res) => {
        req.flash("success", "Welcome back!");
        return res.redirect("/home");
    },

    // Hoa
    logout: (req, res) => {
        req.logout();
        req.flash("success", "Successfully logged out!");
        return res.redirect("/login");
    },

    // Hoa
    renderAboutMe: (req, res) => {
        return res.render("about_me/show");
    },

    // Hoa
    renderEditAboutMe: (req, res) => {
        return res.render("about_me/edit");
    },

    updateAboutMe: (req, res) => {
        // get user info from the form body that was passed through -> Hoa
        const { email, username } = req.body;

        // update user information when given updated email -> Hoa
        db.query(
            "UPDATE users SET email=$1 WHERE username=$2;",
            [email, username],
            (err, result) => {
                // failure if there's an error or if anything other than 1 row is
                if (err || result.rowCount != 1) {
                    // if there's been an error updating, go to the edit page again for the user to try again -> Hao
                    req.flash("error", "Error updating user information");
                    return res.redirect("/about-me/edit");
                }

                // go back to profile viewing page if successful -> Hoa
                req.flash("success", "Successfully updated user information");
                return res.redirect("/about-me");
            }
        );
    },

    renderUserListPage: (req, res) => {
        // get all user info for admin users page -> Hoa
        db.query(
            "SELECT id, email, username, type FROM users ORDER BY type ASC, username ASC",
            [],
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to query users");
                    return res.render("users/show_all", { users: undefined });
                }

                return res.render("users/show_all", { users: result.rows });
            }
        );
    },

    renderUserInfoPage: (req, res) => {
        // get user_id from URL params to use to get user info -> Hoa
        let { user_id } = req.params;
        try {
            user_id = parseInt(user_id);
        } catch (error) {
            req.flash("error", "Unable to query user");
            return res.redirect("/users");
        }

        // get info on specific user -> Hoa
        db.query(
            "SELECT id, email, username, type FROM users WHERE id=$1",
            [user_id],
            (err, result) => {
                // can't get user info then go back to /users -> Hoa
                if (err) {
                    req.flash("error", "Unable to query user");
                    return res.redirect("/users");
                }

                // hoa the user_info page if user info can be ascertained, passing along the user information to the frontend -> Hoa
                return res.render("users/user_info", {
                    user: result.rows[0],
                });
            }
        );
    },

    updateUserInfo: (req, res) => {
        const { email, username, user_type } = req.body;

        // update user type for specific user -> Hoa
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

        // Delete user from db -> Hoa
        db.query(
            "DELETE FROM users WHERE username=$1",
            [username],
            (err, result) => {
                // check if anything went wrong when deleting from DB
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
