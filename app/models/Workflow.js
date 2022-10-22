const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./Usuario");

const Workflow = sequelize.define(
  "Workflow",
  {
    usuario_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    timestamps: true,
    createdAt: "dataCriacao",
    updatedAt: "dataAtualizacao",
    tableName: "workflow"
  }
);

// Workflow.sync({ force: true })
//   .then((r) => console.log("tabela criada com sucesso"))
//   .catch((err) => console.log("erro ao criar a tabela " + err));

module.exports = Workflow;
