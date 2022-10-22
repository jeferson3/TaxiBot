const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transporte = sequelize.define(
  "Transporte",
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
    bandeirada: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
  },
  {
    timestamps: true,
    createdAt: 'dataCriacao',
    updatedAt: 'dataAtualizacao',
    tableName: "transportes"
  }
);

/*
Transporte.sync({ force: true })
  .then(async (r) => {

    console.log("tabela criada com sucesso")
    
    await Transporte.create({
      nome: 'Mototáxi',
      bandeirada: 7.00
    });
    
    await Transporte.create({
      nome: 'Táxi',
      bandeirada: 7.00
    });
      
  })
  .catch((err) => console.log("erro ao criar a tabela " + err));
*/

module.exports = Transporte;
