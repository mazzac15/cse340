const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ********************
 * Build inventory by classification view
 ******************* */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
        errors: null,
    })    
}
/* ********************
 * Build single view by inv_id
 ******************* */
invCont.buildByInvId = async function (req, res, next) {
    const inv_id = req.params.invId
    const data = await invModel.getInvId(inv_id)
    const vehicle = data[0]
    let nav = await utilities.getNav()
    
    const vehicleDetail = await utilities.buildVehicleDetailView(vehicle)
    res.render("./inventory/single", {
        title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        vehicleDetail,
        errors: null,
    })
}

module.exports = invCont