require("dotenv").config();

console.log("Intentando conectar a la base de datos:", {
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  user: process.env.DB_USER
});

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: true,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
