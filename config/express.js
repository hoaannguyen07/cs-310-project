const path = require("path");
const express = require("express");
const session = require("express-session");
const PGSession = require("connect-pg-simple")(session);
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const config = require(".");

module.exports = (app, passport, pool) => {
    app.set("views", path.join(config.root, "views"));
    app.set("view engine", "ejs");

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use(methodOverride("_method"));

    app.use(cookieParser());
    app.use(
        session({
            store: new PGSession({
                pool,
            }),
            saveUninitialized: true,
            secret: config.session_secret,
            resave: false,
            cookie: {
                httpOnly: true,
                expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
                maxAge: 30 * 24 * 60 * 60 * 1000,
            },
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());

    app.use("/", express.static(path.join(config.root, "public")));
};
