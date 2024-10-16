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
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const errorRoute = require("./routes/errorRoute")
const inventoryRoute = require("./routes/inventoryRoute")

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
