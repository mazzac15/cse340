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

/* ********************
 * Build management view
 ******************* */
invCont.buildManagement = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
    })
}

invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    
    res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
    })
}

invCont.processAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    const { classification_name } = req.body
    try {
        let name = await invModel.addClassification(classification_name)
        if (name && name.classification_id) {
            let nav = await utilities.getNav()
            req.flash("notice", `${classification_name} was added successfully.`)
            res.status(201).render("./inventory/management", {
                title: "Vehicle Management",
                nav,
                errors: null,  
            })
        } else{
            req.flash("error", "Please try again.")
            res.status(501).render("./inventory/add-classification", {
                title: "Add New Classification",
                nav,
                errors: null,
            })
        }
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error. Please try again.')
        res.status(500).render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null,
        })
    }
}

invCont.buildAddInventory = async function (req, res, next) {
    try{
        let nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList()
        
        res.render("inventory/add-inventory", {
            title: "Add Vehicle",
            nav,
            classificationList,
            errors: null
        });
    } catch (error) {
        console.error("error building add inventory view:", error);
    }
}

invCont.processAddInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    const vehicle = { 
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    } = req.body

    console.log("processing new vehicle:", vehicle)//debugging

    const classificationList = await utilities.buildClassificationList(vehicle.classification_id)
    try {
        const addVehicleResult = await invModel.addInventory(vehicle)

        console.log("add vehicle result:", addVehicleResult) //debugging

        if (addVehicleResult) {
            req.flash("notice", `Vehicle ${addVehicleResult.inv_make} ${addVehicleResult.inv_model} added successfully.`)
            res.status(201).redirect("/inv/");
        } else {
            req.flash("error", "Failed to add vehicle. Please try again.")
            res.status(501).render("inventory/add-inventory", {
                title: "Add Vehicle",
                nav,
                classificationList,
                errors: null,
            })
        }

    } catch (error) {

        console.error("Error adding vehicle:", error) //debugging

        req.flash("notice", "Sorry, there was an error. Please try again.")
        res.status(500).render("inventory/add-inventory", {
            title: "Add Vehicle",
            nav,
            classificationList,
            errors: null,
        })
    }
}


module.exports = invCont
