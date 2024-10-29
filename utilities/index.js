const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home Page">Home</a></li>'
    data.rows.forEach((row) => {
    list += "<li>"
    list +=
        '<a href="/inv/type/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>"
    list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
            + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
            + 'details"><img src="' + vehicle.inv_thumbnail 
            +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
            +' on CSE Motors" /></a>'
            grid += '<hr>'
            grid += '<div class="namePrice">'
            
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title=View '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice"> Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* **************************************
* Build the single vehicle detail view HTML
* ************************************ */
Util.buildVehicleDetailView = async function(vehicle) {
    let vehicleDetail
    if(vehicle) {
        vehicleDetail = '<div class="single-vehicle">';
        vehicleDetail += '<div class="vehicle-image">';
        vehicleDetail += '<img src="' + vehicle.inv_image + '"alt="Image of '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" />';
        vehicleDetail += '</div>';
        vehicleDetail += '<div class="vehicle-details">';
        vehicleDetail += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model 
            + ' Details' + '</h2>';
        vehicleDetail += '<p class="price"><strong>Price: </strong>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p>';
        vehicleDetail += '<p class="description"><strong>Description: </strong>' + vehicle.inv_description + '</p>';
        vehicleDetail += '<p class="color"><strong>Color: </strong>' + vehicle.inv_color + '</p>';
        vehicleDetail += '<p class="miles"><strong>Miles: </strong>' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</p>';    
    } else {
        vehicleDetail = '<p class="notice">Sorry, this vehicle could not be found.</p>';
    }

    return vehicleDetail;
    
};

Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList = 
        '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (
        
            classification_id != null &&
            row.classification_id == classification_id
        ) {
            classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}

/* **************************************
* Middleware for Handling Errors
* Wrap other function in this for 
* General Error Handling
* ************************************ */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("Please log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            })
    } else {
     next()
    }
}

/* ****************************************
* Check Login
**************************************** */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}

module.exports = Util

