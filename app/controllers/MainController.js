const Corrida = require("../models/Corrida");
const Usuario = require("../models/Usuario");
const Workflow = require("../models/Workflow");

const types = require("../config/types");
const Motorista = require("../models/Motorista");

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
    let status = types.BEM_VINDO;

    (
      async () => 
      {
        let user = await Usuario.findOne({
          where: {
            status: "ATIVO",
            telefone: phone,
          },
        });
   
      if (user) {
        let res = await Workflow.findOne({
          where: {
            usuario_id: user.id,
          },
        });
        status = res.status;
      }
      }
    )();
    
    return status;
  };

  motoristaExists = (phone) => {
    let motorista;
    (
      async () => {
        motorista = await Motorista.findOne({
          where: {
            telefone: phone,
            status: "ATIVO",
          },
        });
      }
    )()
    return motorista !== undefined && motorista !== null ? true : false;
  };

  atualizarStatusWorkflow = async (phone, status) => {
    let user = await Usuario.findOne({
      where: {
        status: "ATIVO",
        telefone: phone,
      },
    });

    if (user) {
      let res = await Workflow.findOne({
        where: {
          usuario_id: user.id,
        },
      });
      status = res.status;
    }
    else {
      
    }
  }

  /*
  send = (client) => {
    let text = `
      De: [${req.body.from.lat}, ${req.body.from.lng}]
      Para: [${req.body.to.lat}, ${req.body.to.lng}]\n
    
      Escolha o tipo de transporte:\n
    `;
    client
      .sendText(phone, text, {
        useTemplateButtons: true,
        buttons: [
          {
            id: "mototaxi",
            text: "Mototáxi",
          },
          {
            id: "taxi",
            text: "Táxi",
          },
        ],
        footer: "UrbanTaxi LTDA.",
      })
      .then(res =>
        res.json({
          status: true,
          data: req.body,
          res
        })
      )
      .catch(
        (err) => () =>
          res.json({
            status: false,
            data: req.body,
            err
          })
      );
  };
  */
}

module.exports = new MainController();
