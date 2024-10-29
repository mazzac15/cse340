/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const utilities = require("./utilities/")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const bodyParser = require("body-parser")
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const errorRoute = require("./routes/errorRoute")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require('./routes/accountRoute')
const session = require("express-session")
const pool = require('./database/')
const cookieParser = require("cookie-parser")


/* ***********************
 * Middleware
 *************************/
app.use(session({
  store: new (require('connect-pg-simple') (session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages') (req, res)
  next()
})

// body parser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// cookie parser middleware
app.use(cookieParser())

// JWTToken middleware
app.use(utilities.checkJWTToken)


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") //not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory Routes
app.use("/inv", utilities.handleErrors(inventoryRoute))
// Account Route
app.use("/account", utilities.handleErrors(accountRoute))
// Error Route
app.use("/error", utilities.handleErrors(errorRoute))

// 404 Error handler
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/

app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  let status = err.status || 500
  let message = err.message
  let title = 'Server Error'

  // Differentiate between error types
  if (status === 404) {
    title = 'Page Not Found'
  } else if (status === 500 && err.message === "Intentional 500 Error: This is a test.") {
    title = '500 Error'
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?'
  }

  res.status(status).render("errors/error", {
    title,
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
