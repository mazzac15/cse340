const utilities = require("../utilities/")
const express = require("express")
const router = new express.Router()
const errorController = require("../controllers/errorController") 

router.get("/footerErr", utilities.handleErrors(errorController.footerError))

module.exports = router