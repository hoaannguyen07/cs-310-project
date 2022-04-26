const express = require("express");
const passport = require("passport");
const db = require("./db");

const port = process.env.PORT || 9000;
const app = express();

// configure the backend to use sessions (& cookies) to keep the user logged in and save the login session, passport to handle user authentication, and routes to handle all routes in the app -> Hoa
require("./config/passport")(passport, db);
require("./config/express")(app, passport, db.pool);
require("./config/routes")(app, passport, db);

const server = app.listen(port, () => {
    console.log(
        `Express app started on port ${port}. Start on http://localhost:${port}`
    );
});

server.on("close", () => {
    console.log("Closed express server");

    db.pool.end(() => {
        console.log("Shut down connection pool");
    });
});
