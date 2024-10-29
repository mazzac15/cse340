// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

/* **************************************
* Deliver Login View
* ************************************ */
router.get("/login", utilities.handleErrors(accountController.buildLogin));

/* **************************************
* Deliver Registration View
* ************************************ */
router.get("/register", utilities.handleErrors(accountController.buildRegister))

/* **************************************
* Process Registration View
* ************************************ */
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))

/* **************************************
* Process Login View
* ************************************ */
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

/* **************************************
* Deliver Account Management View
* ************************************ */
router.get(
    "/",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountManagement))

module.exports = router;