const path = require("path");

const development = require("./env/development");
const test = require("./env/test");
const production = require("./env/production");

const defaults = {
    root: path.join(__dirname, ".."),
};

module.exports = {
    development: { ...defaults, ...development },
    test: { ...defaults, ...test },
    production: { ...defaults, ...production },
}[process.env.NODE_ENV || "development"];
