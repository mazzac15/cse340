// Needed Resources 
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/account-management", {
        title: "Account Management",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
    let nav = await utilities.getNav()
    const {
        account_id = res.locals.accountData.account_id,
        account_firstname = res.locals.accountData.account_firstname,
        account_lastname = res.locals.accountData.account_lastname,
        account_email = res.locals.accountData.account_email
    } = req.body
    res.render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        account_id,
        account_firstname,
        account_lastname,
        account_email
    })
}

/* ****************************************
*  Process registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { 
        account_firstname,
        account_lastname,
        account_email,
        account_password 
    } = req.body

    let hashedPassword
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    
    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if(process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000})
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000})
            }
            return res.redirect("/account/")
        }
        else {
            req.flash("message notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    }catch (error) {
        throw new Error('Access Forbidden')
    }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function logoutAccount (req, res) {
    res.clearCookie("jwt")
    res.redirect("/")
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res) {
    let nav = await utilities.getNav()
    const { 
        account_firstname,
        account_lastname,
        account_email,
    } = req.body

    const account_id = res.locals.accountData.account_id

    try {
        const updateResult = await accountModel.updateAccount(
            account_id,
            account_firstname,
            account_lastname,
            account_email
        )
        console.log("account_id from token:", res.locals.accountData.account_id) //debug

        if (updateResult) {
            const accessToken = jwt.sign(updateResult, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if(process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000})
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000})
            }

            req.flash(
                "notice",
                `Congratulations ${account_firstname}, you\'re account has been updated.`
            )
            res.redirect("/account/")
        } else {
            req.flash("notice", "Sorry, the update failed.")
            res.status(501).render("/account/account-management", {
                title: "Account Management",
                nav,
                errors: null,
            })
        }
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the update.')
        res.status(500).render("account/account-management", {
            title: "Account Management",
            nav,
            errors: null,
        })
    }
}

/* ****************************************
*  Process password update
* *************************************** */
async function updatePassword(req, res) {
    let nav = await utilities.getNav()
    const { account_password } = req.body

    const account_id = res.locals.accountData.account_id
    const account_firstname = res.locals.accountData.account_firstname

    let hashedPassword
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error in updating the password.')
        res.status(500).render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
        })
        return
    }

    try{
        const updateResult = await accountModel.updatePassword(
            account_id,
            hashedPassword
        )

        if (updateResult) {
            req.flash(
                "notice",
                `Congratulations ${account_firstname}, you\'re password has been updated.`
            )
            res.redirect("/account/")
        } else {
            req.flash("notice", "Sorry, the password update failed.")
            res.status(501).render("account/account-management", {
                title: "Account Management",
                nav,
                errors: null,
            })
        }
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the update.')
        res.status(500).render("account/account-management", {
            title: "Account Management",
            nav,
            errors: null,
        })
    }
}



module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildAccountUpdate, logoutAccount, updateAccount, updatePassword }

