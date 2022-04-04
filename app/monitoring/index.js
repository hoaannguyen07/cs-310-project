module.exports = {
    health: (db) => (req, res, next) => {
        db.query("SELECT 1", (err) => {
            if (err) {
                req.flash("error", "Error running health check query on DB");
                return next(err);
            }

            return res.sendStatus(200);
        });
    },
};
