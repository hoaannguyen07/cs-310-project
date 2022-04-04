module.exports = {
    db: {
        user: "postgres",
        password: "postgres",
        database: "db-310-dev",
        host: "db-310-dev.crd5xwkqdc4a.us-east-1.rds.amazonaws.com",
        port: 5432,
        max: 50,
        idleTimeoutMillis: 30000,
    },
    session_secret: "secret",
};
