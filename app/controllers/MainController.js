const Usuario = require("../models/Usuario");
const Workflow = require("../models/Workflow");

const types = require("../config/types");
const Motorista = require("../models/Motorista");

class MainController {

  index = (req, res) => res.render("map", { phone: req.query.phone });

  verificarWorkflowUsuario = async (phone) => {
    let status = types.BEM_VINDO;
  
    let user = await Usuario.findOne({
      where: {
        status: "ATIVO",
        telefone: phone,
      },
    });

    console.log(user);

    if (user !== undefined && user !== null) {
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
    }

    return status;
  };

  motoristaExists = async (phone) => {
    let motorista = await Motorista.findOne({
        where: {
          telefone: phone,
          status: "ATIVO",
        },
      });

    return motorista !== undefined && motorista !== null;
  };

  atualizarStatusWorkflow = async (phone, status) => {

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
  };

}

module.exports = new MainController();
