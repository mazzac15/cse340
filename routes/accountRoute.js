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
    utilities.checkJWTToken,
    utilities.handleErrors(accountController.buildAccountManagement))

/* **************************************
* Deliver Account Update View
* ************************************ */
router.get(
    "/update",
    utilities.checkJWTToken,
    utilities.handleErrors(accountController.buildAccountUpdate))

/* **************************************
* Process Account Update
* ************************************ */
router.post(
    "/update",
    utilities.checkJWTToken,
    regValidate.updateAccountRules(),
    regValidate.checkUpdateData,
    utilities.handleErrors(accountController.updateAccount))   

/* **************************************
* Process Password Update
* ************************************ */
router.post(
    "/update-password",
    utilities.checkJWTToken,
    regValidate.updatePasswordRules(),
    regValidate.checkPasswordData,
    utilities.handleErrors(accountController.updatePassword))



/* **************************************
* Deliver Logout View
* ************************************ */
router.get("/logout", utilities.handleErrors(accountController.logoutAccount));


module.exports = router;

