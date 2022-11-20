const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Motorista = sequelize.define(
  "Motorista",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ATIVO', 'INATIVO'),
      allowNull: false,
      defaultValue: 'ATIVO'
    },
  },
  {
    timestamps: true,
    createdAt: 'dataCriacao',
    updatedAt: 'dataAtualizacao',
    tableName: "motoristas"
  }
);

// Motorista.sync({ force: true })
//   .then((r) => console.log("tabela criada com sucesso"))
//   .catch((err) => console.log("erro ao criar a tabela " + err));


module.exports = Motorista;
