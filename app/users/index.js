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
        // Query and email portion of landing done by Zach, get email status for that user and pass to page for render
        db.query(
            "SELECT id, user_id, allow_post_notifications, allow_comment_notifications FROM email_list WHERE user_id=$1;",
            [req.user.id],
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to query email list");
                    return res.render("/home");
                }
                return res.render("about_me/show", {
                    email_list: result.rows[0],
                });
            }
        );
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

    // Zach
    // Renders the edit email page with the correct status of the user's email
    renderEditEmail:(req, res) =>{
        // Gets the current user's email data
        db.query(
            "SELECT id, user_id, allow_post_notifications, allow_comment_notifications FROM email_list WHERE user_id=$1;",
            [req.user.id],
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to query email list");
                    return res.render("/about_me");
                }
                // console.log(result.rows[0])
                return res.render("about_me/email", {
                    email_list: result.rows[0],
                });
            }
        );
    },
    
    // Zach
    // Update the changes to email data to the database
    updateEmail: (req, res) =>{
        // Get the changes from the form
        const {post, comment} = req.body;
        // update the database with the changes from the form
        db.query(
            "UPDATE email_list SET allow_post_notifications=$1, allow_comment_notifications=$2 WHERE user_id=$3;",
            [post, comment, req.user.id],
            (err, result) => {
                // failure if there's an error or if anything other than 1 row is sent
                if (err || result.rowCount != 1) {
                    req.flash(
                        "error",
                        `Error updating email information`
                    );
                } else {
                    req.flash(
                        "success",
                        `Successfully updated email information`
                    );
                }
                // Send back to about me landing
                return res.redirect("/about-me");
            }
        );
    },

    // Zach
    // Insert email into email list
    addEmail: (req, res) =>{
        // adds the user's email into the email_list table with default values, then redirects user to edit page to set what they would like
        db.query(
            "INSERT INTO email_list(user_id, allow_post_notifications, allow_comment_notifications) VALUES ($1, $2, $3);",
            [req.user.id, false, false],
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to register email");
                    return res.redirect("/about-me");
                }
                return res.redirect("/about-me/email");
            }
        );
    },

    // Zach
    // Delete feature for email_list, allows user to remove their email from the notifications table
    deleteEmail: (req, res) =>{
        // deletes the row for the current user's email
        db.query(
            "DELETE FROM email_list WHERE user_id=$1;",
            [req.user.id],
            (err, result) => {
                if (err) {
                    req.flash("error", "Unable to delete email");
                    return res.redirect("/about-me/email");
                }
                req.flash("success", "Removed email from email list")
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
                    // render page to show all users but pass in nothing for users b/c there are no info info that could be found in the db -> Hoa
                    return res.render("users/show_all", { users: undefined });
                }
                // render page to show all users and pass in all user info -> Hoa
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
