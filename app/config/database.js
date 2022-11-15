const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("taxiBot", "root", "", {
  host: "localhost",
  dialect: "mysql",
  timezone: '-03:00',
  logging: false
});

sequelize
  .authenticate()
  .then((r) => {})
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

module.exports = sequelize;
