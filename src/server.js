const express = require('express')
const session = require('express-session')
const LokiStore = require('connect-loki')(session)
const nunjucks = require('nunjucks')
const path = require('path')
const flash = require('connect-flash')
// path é uma biblioteca que vem já configurada no node
// Ele server para lidar com caminhos no servidor
// No windows a barra é contrária, por isso é interessante utilizar o path

class App {
  constructor () {
    this.express = express()
    // variavel que diz se está em ambiente de desenvolvimento ou produção
    this.isDev = process.env.NODE_ENV !== 'production'

    // importante a ordem em que se encontra
    this.middlewares()
    this.views()
    this.routes()
  }

  middlewares () {
    this.express.use(express.urlencoded({ extended: false }))
    this.express.use(flash())
    this.express.use(
      session({
        name: 'root',
        secret: 'MyAppSecret',
        store: new LokiStore({
          path: path.resolve(__dirname, '..', 'tmp', 'sessions.db')
        }),
        resave: true,
        saveUninitialized: true
      })
    )
  }

  views () {
    nunjucks.configure(path.resolve(__dirname, 'app', 'views'), {
      // watch: true somente em ambiente de desenvolvimento, pois pode haver
      // perca de performance se for no server em produção
      watch: this.isDev,
      express: this.express,
      autoescape: true
    })

    this.express.use(express.static(path.resolve(__dirname, 'public')))
    this.express.set('view engine', 'njk')
  }

  routes () {
    this.express.use(require('./routes'))
  }
}

// Vai exportar uma instancia de App e não a classe App em si
// Mas como seria interessante utilizar somente o express da classe, por isso
// exporta somente o express
module.exports = new App().express
