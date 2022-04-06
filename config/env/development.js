module.exports = {
    db: {
        user: "postgres",
        password: "postgres",
        database: "cs_310_db",
        host: "cs-310-db.c9ncqlvp1kw9.us-east-2.rds.amazonaws.com",
        port: 5432,
        max: 50,
        idleTimeoutMillis: 30000,
    },
    session_secret: "secret",
};
