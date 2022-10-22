const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Motorista = require("./Motorista");
const Transporte = require("./Transporte");
const Usuario = require("./Usuario");
const Workflow = require("./Workflow");

const Corrida = sequelize.define(
  "Corrida",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Usuario,
        key: "id",
      },
    },
    motorista_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Motorista,
        key: "id",
      },
    },
    transporte_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Transporte,
        key: "id",
      },
    },
    workflow_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Workflow,
        key: "id",
      },
    },
    de: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    para: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    data: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },

    status: {
      type: DataTypes.ENUM("PENDENTE", "CANCELADO", "PAGO"),
      allowNull: false,
      defaultValue: "PENDENTE",
    },
    
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    
  },
  {
    timestamps: true,
    createdAt: "dataCriacao",
    updatedAt: "dataAtualizacao",
    tableName: "corridas",
  }
);

// Corrida.sync({ force: true })
//   .then((r) => console.log("tabela criada com sucesso"))
//   .catch((err) => console.log("erro ao criar a tabela " + err));

Usuario.belongsToMany(Motorista, {
  onDelete: "RESTRICT",
  onUpdate: "RESTRICT",
  foreignKey: "usuario_id",
  through: Corrida,
});

Motorista.belongsToMany(Usuario, {
  onDelete: "RESTRICT",
  onUpdate: "RESTRICT",
  foreignKey: "motorista_id",
  through: Corrida,
});

module.exports = Corrida;
