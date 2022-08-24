const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("urbanTaxi", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then((r) => {})
  .catch((err) => {
    console.error("Unable to connect to the database:", error);
  });

module.exports = sequelize;
