const types = require("../config/types");
const Corrida = require("../models/Corrida");

const moment = require('moment-timezone');

class MainController {


  store = async (body) => {
    
    try {

      let c = await Corrida.create({
        ...body,
        data: moment().tz('America/Sao_Paulo').format()
      });

      return c;
    }

    catch(error) {
      return null;
    }
  }


  update = async (rel, data) => {

    await Corrida.findOne({
      where: {
        workflow_id: rel.wf.id
      }
    })
    .then(async c => {
      if (c === undefined || c === null) {
        await this.store({
          ...data,
          usuario_id: rel.user.id,
          workflow_id: rel.wf.id
        })
      }
  
      else {
        await c.update({
            ...data
          });
      }
    })
  };

  cancelarSolicitacaoCorrida = async (wf) => {

    await Corrida.findOne({
      where: {
        workflow_id: wf.id,
      }
    })
    .then(async c => {
      if (c !== undefined && c !== null && c.status === 'PENDENTE') {
        await c.update({
            status: 'CANCELADO'
          });
      }
    })
  };

  concluirSolicitacaoCorrida = async (wf) => {

    await Corrida.findOne({
      where: {
        workflow_id: wf.id,
      }
    })
    .then(async c => {
      if (c !== undefined && c !== null && c.status === 'PENDENTE') {
        await c.update({
            status: 'SOLICITADO'
          });
      }
    })
  };

  finalizarCorrida = async (wf) => {

    await Corrida.findOne({
      where: {
        workflow_id: wf.id,
      }
    })
    .then(async c => {
      if (c !== undefined && c !== null && c.status === 'PENDENTE') {
        await c.update({
            status: 'FINALIZADO'
          });
      }
    })
  };

}

module.exports = new MainController();
