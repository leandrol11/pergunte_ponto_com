// configurando o express, body-parser e banco de dados
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const connection = require("./database/database")
const Pergunta = require("./database/Pergunta")
const Resposta = require("./database/Resposta")

// configurando o ejs
app.set("view engine", "ejs")

// configurando para poder adicionar arquivos estáticos(css, js, img e etc)
app.use(express.static("public"))

// configurando body-parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// configurando conexão com banco de dados
connection.authenticate().then(() => {
    console.log("Conexão deu bom")
}).catch((msgErro) => {
    console.log("Deu erro na conexão")
})

//rotas 
// carregando a página index -- tem q estar dentro de views, então n tem q falar a pasta
app.get("/", (req, res) => {
    Pergunta.findAll({
        raw: true,
        order: [
            ["id", "DESC"]
        ]
    }).then(perguntas => {
        res.render("index", {
            perguntas: perguntas
        })
    })
})

// carregando a página perguntas
app.get("/perguntas", (req, res) => {
    res.render("perguntas")
})

// carregando e salvando dados formulário
app.post("/salvaPergunta", (req, res) => {
    let titulo = req.body.titulo
    let descricao = req.body.descricao
    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(() => {
        res.redirect("/")
    })
})

// carregando as páginas de cada pergunta
app.get("/pergunta/:id", (req, res) => {
    let id = req.params.id
    Pergunta.findOne({
        where: { id: id }
    }).then(pergunta => {
        if (pergunta != undefined) {
            Resposta.findAll({
                where: { perguntaId: pergunta.id },
            }).then(respostas => {
                res.render("pergunta", {
                    pergunta: pergunta,
                    respostas: respostas
                })
            })
        } else {
            res.redirect("/")
        }
    })
})

// carregando e salvando os dados das repostas
app.post("/responder", (req, res) => {
    let corpo = req.body.corpo
    let perguntaId = req.body.pergunta
    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(() => {
        res.redirect("/pergunta/" + perguntaId)
    })
})

//ligando o server
app.listen(8000, () => {
    console.log("Ta rodando")
})