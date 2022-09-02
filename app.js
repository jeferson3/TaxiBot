const express = require("express");
const wppconnect = require("@wppconnect-team/wppconnect");
const path = require("path");
const cors = require("cors");
const types = require("./app/config/types");
const MainController = require("./app/controllers/MainController");
const Motorista = require("./app/models/Motorista");
const { BASE_URL } = require("./app/.env");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/app/views"));

// app.get("/", MainController.index);
// app.get("/usuarios", MainController.usuarios);

wppconnect
  .create({
    session: "sessionName",
    headless: true, // Headless chrome
    debug: true,
  })
  .then((client) => start(client))
  .catch((error) => console.log(error));

function start(client) {
  client.onMessage((message) => {
    
    console.log("nova mensagem");
    
    var phone = message.from;
    var nome  = message.notifyName
    
    console.log("core");

    let exists = MainController.motoristaExists(phone);

    // verifica se o número é de um motorista
    if (!exists) {

      // verificar se o celular já tem uma solicitação em andamento
      let status = MainController.verificarWorkflowUsuario(phone);

      if (message.body != "Solicitar corrida" && status === types.BEM_VINDO) {
        welcome(client, phone, nome);
      } else if (
        message.body == "Solicitar corrida" &&
        status === types.BEM_VINDO
      ) {
        mapa(client, phone);
      } else if (
        (message.body == "Mototáxi" || message.body == "Táxi") &&
        types.ESCOLHER_TIPO
      ) {
        calcularTotal(client, phone);
      } else if (message.body == "Concluir" && types.ESCOLHER_TIPO) {
        finalizar(client, phone);
      } else if (message.body == "Cancelar" && types.ESCOLHER_TIPO) {
        cancelar(client, phone);
      } else {
        mensagemInvalida(client, phone, nome);
      }
    }
  });

  app.get("/", MainController.index);

  app.post("/send-localization", function (req, res) {
    
    console.log('sended ' + Date.now());

    let text =
      `De: [${req.body.from.latitude}, ${req.body.from.longitude}]\n` +
      `Para: [${req.body.to.latitude}, ${req.body.to.longitude}]\n` +
      "Escolha o tipo de transporte:";

    client
      .sendText(req.body.phone, text, {
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
      .then((r) => {

        MainController.atualizarStatusWorkflow(req.body.phone, types.ESCOLHER_TIPO);

        return res.json({
          status: true,
          data: req.body,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.json({
          status: false,
          data: err,
        });
      });
  });
}

function welcome(client, phone, nome) {
  client
    .sendText(
      phone,
      `Olá *${nome}*, seja bem vindo ao transporte urbano da sua cidade.\n Para começar a usar o serviço, escolha uma das opções abaixo:`,
      {
        useTemplateButtons: true,
        buttons: [
          {
            id: "menu solicitar corrida",
            text: "Solicitar corrida",
          },
          {
            phoneNumber: "+55 11 22334455",
            text: "Central de atendimento",
          },
        ],
        footer: "UrbanTaxi LTDA.",
      }
    )
    .then((r) => MainController.atualizarStatusWorkflow(phone, types.BEM_VINDO))
    .catch((err) => console.log(err));
}

function mapa(client, phone) {
  client
    .sendText(phone, "Clique no link abaixo e escolha o destino no mapa:", {
      useTemplateButtons: true,
      buttons: [
        {
          url: BASE_URL + "?phone=" + phone,
          text: "Mapa",
        },
      ],
      footer: "UrbanTaxi LTDA.",
    })
    .then((r) =>
      MainController.atualizarStatusWorkflow(phone, types.SOLICITADO)
    )
    .catch((err) => console.log(err));
}

function calcularTotal(client, phone) {
  let text =
    "Percurso    = 9km\n" +
    "Bandeirada  = R$ 7,00\n" +
    "Valor extra = R$ 3,00\n" +
    "Valor total = R$ 10,00";

  client
    .sendText(phone, text, {
      useTemplateButtons: true,
      buttons: [
        {
          id: "concluir",
          text: "Concluir",
        },
        {
          id: "cancelar",
          text: "Cancelar",
        },
      ],
      footer: "UrbanTaxi LTDA.",
    })
    .then()
    .catch((err) => console.log(err));
}

function finalizar(client, phone) {
  let text =
    "O motorista acabou de receber o  seu pedido. Aguarde no ponto de partida.\n" +
    "A UrbanTaxi agradece pela preferência. Tenha uma boa viagem.";
  client
    .sendText(phone, text)
    .then((r) => MainController.atualizarStatusWorkflow(phone, types.CONCLUIDO))
    .catch((err) => console.log(err));
}

function cancelar(client, phone) {
  let text = "Operação cancelada";
  client
    .sendText(phone, text)
    .then((r) => MainController.atualizarStatusWorkflow(phone, types.CANCELADO))
    .catch((err) => console.log(err));
}

function mensagemInvalida(client, phone, nome) {
  let text = "Desculpe, não consegui entender. Vamos tentar novamente?";
  client
    .sendText(phone, text)
    .then((r) => {
      let status = MainController.verificarWorkflowUsuario(phone);
console.log('status', status);
      if (status === types.BEM_VINDO) {
        welcome(client, phone, nome);
      } else if (status === types.SOLICITADO) {
        mapa(client, phone);
      } else if (types.ESCOLHER_TIPO) {
        calcularTotal(client, phone);
      }
    })
    .catch((err) => console.log(err));
}

app.listen(8000, () => console.log("server running..."));
