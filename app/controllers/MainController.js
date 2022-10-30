const Usuario = require("../models/Usuario");
const Workflow = require("../models/Workflow");

const types = require("../config/types");
const Motorista = require("../models/Motorista");

const Seq = require('sequelize');
const moment = require('moment-timezone');

const CorridaController = require("./CorridaController");
const Corrida = require("../models/Corrida");
const Transporte = require("../models/Transporte");

const DistanciaLatLong = require('../services/DistanciaLatLong');

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

    let res = await Workflow.findOne({
      where: {
        usuario_id: user.id
      },
      order: [ [ 'id', 'DESC' ]],
    });
    if (res !== undefined && res !== null) {
      status = res.status;
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

    await Workflow.update(
      {
        status,
        data: moment().tz('America/Bahia').format()
      },
      {
        where: {
          usuario_id: user.id,
          status: {[Seq.Op.notIn]:[types.CONCLUIDO, types.CANCELADO]},
          data: {
            [Seq.Op.gt]: moment().tz('America/Bahia').subtract(5, 'minutes').format()
          }
        },
      }
    );
  };

  processarMensagemUsuario = async (phone, mensagem) => {

    let msg = mensagem.body?.toLowerCase();
    let type = mensagem.type;

    let user = await Usuario.findOne({
      where: {
        status: "ATIVO",
        telefone: phone,
      },
    });

    if (user === undefined || user === null) {
      user = await Usuario.create({
        nome: mensagem.notifyName ?? 'usuário',
        telefone: phone,
        status: "ATIVO",
      });
    }

    // verifica se ja existe um wf em andamento com no máximo 5 minutos
    let wf = await Workflow.findOne({
      where: {
        usuario_id: user.id,
        status: {[Seq.Op.notIn]:[types.CONCLUIDO, types.CANCELADO]},
        data: {
          [Seq.Op.gt]: moment().tz('America/Bahia').subtract(5, 'minutes').format()
        }
      },
    });

    let statusAtualizado = false;

    if (wf === undefined || wf === null) {
      statusAtualizado = true;
    
      wf = await Workflow.create({
        usuario_id: user.id,
        status: types.BEM_VINDO,
        data: moment().tz('America/Bahia').format()
      });
    }
    let status = wf.status;
    
    let localizacao = {};
    if (type === 'location') {
      localizacao = {
        name: mensagem.loc,
        lat: mensagem.lat,
        lng: mensagem.lng
      }
    }

    if (msg === 'solicitar corrida') {
      await this.atualizarStatusWorkflow(phone, types.SOLICITADO)
    }

    else if (type === 'location' && status === types.SOLICITADO){
      await CorridaController.update({user, wf}, {de: localizacao})
      await this.atualizarStatusWorkflow(phone, types.LOCALIZACAO_DE)
    }

    else if (type === 'location' && status === types.LOCALIZACAO_DE){
      await CorridaController.update({user, wf}, {para: localizacao})
      await this.atualizarStatusWorkflow(phone, types.LOCALIZACAO_PARA)
    }

    else if (status === types.LOCALIZACAO_PARA && (msg === 'mototáxi' || msg === 'táxi')){
      await this.atualizarStatusWorkflow(phone, types.ESCOLHER_TIPO)
      await CorridaController.update({user, wf}, {transporte_id: msg === 'mototáxi' ? 1 : 2})      
    }

    else if (status === types.ESCOLHER_TIPO && msg === 'concluir'){
      await this.atualizarStatusWorkflow(phone, types.CONCLUIDO)
      await CorridaController.concluirSolicitacaoCorrida(wf);
    }

    else if (status === types.ESCOLHER_TIPO && msg === 'cancelar'){
      await this.atualizarStatusWorkflow(phone, types.CANCELADO)
      await CorridaController.cancelarSolicitacaoCorrida(wf);
    }

    else if (!statusAtualizado) {
      return false;
    }

    return true;

  }

  calcularTotal = async (phone) => {

    let user = await Usuario.findOne({
      where: {
        status: "ATIVO",
        telefone: phone,
      },
    });

    let wf = await Workflow.findOne({
      where: {
        usuario_id: user.id,
      },
      order: [ [ 'id', 'DESC' ]]
    });

    let corrida = await Corrida.findOne({
      where: {
        workflow_id: wf.id,
      }
    });

    let transporte = await Transporte.findOne({
      where: {
        id: corrida.transporte_id,
      }
    });

    let loc_de = JSON.parse(corrida.de);
    let loc_para = JSON.parse(corrida.para);
    let bandeirada = transporte.bandeirada;


    let percurso = DistanciaLatLong.getDistanceFromLatLonInKm(
      {lat: loc_de.lat, lng: loc_de.lng},
      {lat: loc_para.lat, lng: loc_para.lng}
    );
    let total = percurso * bandeirada;

    if (total < bandeirada) {
      total = bandeirada;
    }

    await CorridaController.update({user, wf}, { valor: total })

    total = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    let res = `Percurso     = ${percurso}km\n` +
              `Bandeirada  = R$ ${bandeirada}\n` +
              `Valor total  = R$ ${total}`;

    let map = `https://www.google.com.br/maps/dir/`
                +  `${loc_de.lat},${loc_de.lng}/`
                +  `${loc_para.lat},${loc_para.lng}`;
    return {
      txt: res,
      mapa: map
    };
  }

}

module.exports = new MainController();
