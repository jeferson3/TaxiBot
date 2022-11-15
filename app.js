process.env.TZ = 'America/Bahia';

const express = require("express");
const wppconnect = require("@wppconnect-team/wppconnect");
const path = require("path");
const cors = require("cors");
const types = require("./app/config/types");
const MainController = require("./app/controllers/MainController");
const { BASE_URL } = require("./app/.env");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/app/views"));

//app.get("/", MainController.index);

wppconnect
  .create({
    session: "sessionName",
    headless: true, // Headless chrome
    debug: true,
  })
  .then((client) => start(client))
  .catch((error) => console.log(error));

function start(client) {

  client.onMessage(async (message) => {

    var phone = message.from;
    var nome  = message.notifyName.split(' ')[0] ?? 'Usuário';
  
    let exists = await MainController.motoristaExists(phone);

    // verifica se o número não é de um motorista
    if (!exists) {

      // processar mensagem do usuário
      let processamento = await MainController.processarMensagemUsuario(phone, message);

      // verificar se o celular já tem uma solicitação em andamento
      let status = await MainController.verificarWorkflowUsuario(phone);

      // manda mensagem de boas vindas com menu de opção(solicitar corrida, central)
      if (status === types.BEM_VINDO) {
        if (processamento) {
          welcome(client, phone, nome);          
        }
        else {
          mensagemInvalida(client, phone, nome, types.BEM_VINDO)
        }
      } 
      
      // cliente solicita corrida
      else if (status === types.SOLICITADO) {
        if (processamento) {
          localizacaoDe(client, phone);
        }
        else {
          mensagemInvalida(client, phone, nome, types.SOLICITADO)
        }
      } 
      
      // cliente envia localização dele
      else if (status === types.LOCALIZACAO_DE) {
        if (processamento) {
          localizacaoPara(client, phone);
        }
        else {
          mensagemInvalida(client, phone, nome, types.LOCALIZACAO_DE)
        }
      } 
      
      // cliente envia localização do destino
      else if (status === types.LOCALIZACAO_PARA) {
        if (processamento) {
          escolherTipoTransporte(client, phone);
        }
        else {
          mensagemInvalida(client, phone, nome, types.LOCALIZACAO_PARA)
        }
      } 
      
      // cliente escolhe o tipo de transporte
      else if (status === types.ESCOLHER_TIPO) {
        let res = await MainController.calcularTotal(phone);
        if (processamento) {
          calcularTotal(client, phone, res);
        }
        else {
          mensagemInvalida(client, phone, nome, types.ESCOLHER_TIPO, res)
        }
      } 
      
      // cliente finaliza solicitação
      else if (status === types.CONCLUIDO) {
        if (processamento) {
          finalizar(client, phone, nome);
        }
        else {
          mensagemInvalida(client, phone, nome, types.CONCLUIDO)
        }
      } 
      
      // cliente cancela solicitação
      else if (status === types.CANCELADO) {
        if (processamento) {
          cancelar(client, phone);
        }
        else {
          mensagemInvalida(client, phone, nome, types.CANCELADO)
        }  
      } 

    }
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
        footer: "TaxiBot LTDA.",
      }
    )
    .then()
    .catch((err) => console.log(err));
}

function calcularTotal(client, phone, res) {

  let txt = 'Verifique se o trajeto da sua corrida está correta: '
  client
    .sendText(phone, txt, {
        useTemplateButtons: true,
        buttons: [
          {
            url: res.mapa,
            text: "Google Maps",
          }
        ],
        footer: "TaxiBot LTDA.",
      }
    )
    .then(r => {

      client
        .sendText(phone, res.txt, {
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
          footer: "TaxiBot LTDA.",
        })
        .then()
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));

}

function finalizar(client, phone, nome) {

  let text =
    "Sua solicitação foi registrada com sucesso, aguarde até um motorista aceitar sua corrida.";
  client
    .sendText(phone, text)
    .then(async r => {
      let res = await MainController.calcularTotal(phone);
      
      let txt = 'Cliente     = ' + nome + '\n' + res.txt
      client
        .sendText(types.GROUP_ID, txt, {
            useTemplateButtons: true,
            buttons: [
              {
                url: res.mapa,
                text: "Google Maps",
              }
            ],
            footer: "TaxiBot LTDA.",
          }
        )
        .then()
        .catch((err) => console.log(err));

    })
    .catch((err) => console.log(err));
}

function cancelar(client, phone) {
  let text = "Operação cancelada";
  client
    .sendText(phone, text)
    .then()
    .catch((err) => console.log(err));
}

function localizacaoDe(client, phone) {
  
  let text = "Para iniciar uma nova corrida, precisamos que nos envie sua localização:\n" + 
		          "Para saber como enviar localização no whatsapp clique no link abaixo e veja um tutorial\n"
		
  client
    .sendText(phone, text, {
        useTemplateButtons: true,
        buttons: [
          {
            url: "https://tecnoblog.net/responde/como-mandar-a-sua-localizacao-pelo-whatsapp",
            text: "Tutorial",
          }
        ],
        footer: "TaxiBot LTDA.",
      }
    )
    .then()
    .catch((err) => console.log(err));
    

}

function localizacaoPara(client, phone) {
  
  let text = "Muito bem, agora precisamos que nos envie a localização de onde deseja ir:\n" + 
		          "Para saber como enviar localização no whatsapp clique no link abaixo e veja um tutorial\n"
		
  client
    .sendText(phone, text, {
        useTemplateButtons: true,
        buttons: [
          {
            url: "https://tecnoblog.net/responde/como-mandar-a-sua-localizacao-pelo-whatsapp",
            text: "Tutorial",
          }
        ],
        footer: "TaxiBot LTDA.",
      }
    )
    .then(res => console.log())
    .catch((err) => console.log(err));
    

}

function escolherTipoTransporte(client, phone) {
  
  let text = "Escolha o tipo de transporte:\n"
		
  client
    .sendText(phone, text, {
        useTemplateButtons: true,
        buttons: [
          {
            id: "tipo-mototaxi",
            text: "Mototáxi",
          },
          {
            id: "tipo-taxi",
            text: "Táxi",
          }
        ],
        footer: "TaxiBot LTDA.",
      }
    )
    .then()
    .catch((err) => console.log(err));
    

}

function mensagemInvalida(client, phone, nome, type, txt = '') {
  let text = "Desculpe, não consegui entender. Vamos tentar novamente?";
  client
    .sendText(phone, text)
    .then(r => {
      switch (type) {
        case types.BEM_VINDO:
          welcome(client, phone, nome); 
          break;
      
        case types.SOLICITADO:
          localizacaoDe(client, phone);
          break;

        case types.LOCALIZACAO_DE:
          localizacaoPara(client, phone);
          break;

        case types.LOCALIZACAO_PARA:
          escolherTipoTransporte(client, phone);
          break;

        case types.ESCOLHER_TIPO:
          calcularTotal(client, phone, txt);
          break;

        case types.CONCLUIDO:
          finalizar(client, phone, nome);
          break;

        case types.CANCELADO:
          cancelar(client, phone);
          break;

        default:
          break;
      }
    })
}

app.listen(8000, () => console.log("server running..."));
