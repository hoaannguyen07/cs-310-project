const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;

module.exports = (passport, db) => {
    passport.use(
        new LocalStrategy((username, password, cb) => {
            db.query(
                "SELECT id, email, username, password, type FROM users WHERE username=$1",
                [username],
                (err, result) => {
                    if (err) {
                        console.error(
                            "Error when selecting user on login",
                            err
                        );
                        return cb(err);
                    }

                    if (result.rows.length > 0) {
                        const first = result.rows[0];
                        bcrypt.compare(password, first.password, (_, res) => {
                            if (res) {
                                cb(null, {
                                    id: first.id,
                                    username: first.username,
                                    type: first.type,
                                });
                            } else {
                                cb(null, false);
                            }
                        });
                    } else {
                        cb(null, false);
                    }

                    return 0;
                }
            );
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, cb) => {
        db.query(
            "SELECT id, email, username, type FROM users WHERE id = $1",
            [parseInt(id, 10)],
            (err, results) => {
                if (err) {
                    console.error(
                        "Error when selecting user on session deserialize",
                        err
                    );
                    return cb(err);
                }

                cb(null, results.rows[0]);

                return 0;
            }
        );
    });
};
