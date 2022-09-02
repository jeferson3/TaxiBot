const Corrida = require("../models/Corrida");
const Usuario = require("../models/Usuario");
const Workflow = require("../models/Workflow");

const types = require("../config/types");
const Motorista = require("../models/Motorista");
const { NOW } = require("sequelize");

class MainController {
  index = (req, res) => res.render("map", { phone: req.query.phone });

  usuarios = async (req, res) => {
    let [usuarios, corridas, workflow] = await Promise.all([
      // Usuario.findAll({ include: Motorista }),
      Usuario.findAll(),
      Corrida.findAll(),
      Workflow.findAll(),
    ]);
    return res.json([usuarios, corridas, workflow]);
  };

  verificarWorkflowUsuario = (phone) => {
    let status;

    (async () => {
      let user = await Usuario.findOne({
        where: {
          status: "ATIVO",
          telefone: phone,
        },
      });

      console.log(user);

      if (user !== undefined && user !== null) {
        console.log('user');
        let res = await Workflow.findOne({
          where: {
            usuario_id: user.id,
          },
        });
        console.log(res);
        if (res !== undefined && res !== null) {
          console.log('res');
          status = res.status;
        }
        else {
          status = types.BEM_VINDO;
        }
      }
    })();

    return status;
  };

  motoristaExists = (phone) => {
    let motorista;
    (async () => {
      motorista = await Motorista.findOne({
        where: {
          telefone: phone,
          status: "ATIVO",
        },
      });
    })();
    return motorista !== undefined && motorista !== null ? true : false;
  };

  atualizarStatusWorkflow = (phone, status) => {

    (async () => {
      let user = await Usuario.findOne({
        where: {
          status: "ATIVO",
          telefone: phone,
        },
      });
      if (user === undefined || user === null) {
        user = await Usuario.create({
          nome: "usuario",
          telefone: phone,
          status: "ATIVO",
        });
      }

      let wf = await Workflow.findOne({
        where: {
          usuario_id: user.id,
        },
      });

      if (wf === undefined || wf === null) {
        await Workflow.create({
          usuario_id: user.id,
          status: types.BEM_VINDO,
        });
      } else {
        await Workflow.update(
          {
            status,
          },
          {
            where: {
              usuario_id: user.id,
            },
          }
        );
      }
    })();
  };
}

module.exports = new MainController();
