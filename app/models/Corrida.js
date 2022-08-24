const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Motorista = require("./Motorista");
const Usuario = require("./Usuario");

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
      references: {
        model: Motorista,
        key: "id",
      },
    },
    de: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    para: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },

    status: {
      type: DataTypes.ENUM("PENDENTE", "CANCELADO", "PAGO"),
      allowNull: false,
      defaultValue: "PENDENTE",
    },
    
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
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
