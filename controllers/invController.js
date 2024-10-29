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
    try {
        const inv_id = parseInt(req.params.invId)
        let nav = await utilities.getNav()
        const vehicleData = await invModel.getInvId(inv_id)

        if(!vehicleData) {
            req.flash("notice", "Sorry, we couldn't find that vehicle.")
            res.redirect("/")
        }

        const vehicleDetail = await utilities.buildVehicleDetailView(vehicleData)

        res.render("./inventory/single", {
            title: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
            nav,
            vehicleDetail,
            errors: null,
        })

    } catch (error) {
        req.flash("notice", "Sorry, we couldn't find that vehicle")
        res.redirect("/")
    }    
}

/* ********************
 * Build management view
 ******************* */
invCont.buildManagement = async function (req, res, next) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        classificationList,
        errors: null,
    })
}

/* ********************
 * Build add classification view
 ******************* */
invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    
    res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
    })
}

/* ********************
 * Process add classification view
 ******************* */
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

/* ************************
 * Build add inventory view
 *********************** */
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

/* ************************
 * Process add inventory view
 *********************** */
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

    const classificationList = await utilities.buildClassificationList(vehicle.classification_id)
    try {
        const addVehicleResult = await invModel.addInventory(vehicle)

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

        req.flash("notice", "Sorry, there was an error. Please try again.")
        res.status(500).render("inventory/add-inventory", {
            title: "Add Vehicle",
            nav,
            classificationList,
            errors: null,
        })
    }
}


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

/* ************************
 * Build edit inventory view
 *********************** */
invCont.buildEditInventory = async function (req, res, next) {
    try {
        const inv_id = parseInt(req.params.inv_id)

        let nav = await utilities.getNav()
        const itemData = await invModel.getInvId(inv_id)

        if(!itemData) {
            req.flash("notice", "Sorry, we couldn't find that vehicle.")
            return res.redirect("/inv/")
        }

        const classificationList = await utilities.buildClassificationList(itemData.classification_id)
        
        
        res.render("./inventory/edit-inventory", {
                title: "Edit " + itemData.inv_make + " " + itemData.inv_model,
                nav,
                classificationList: classificationList,
                errors: null,
                inv_id: itemData.inv_id,
                inv_make: itemData.inv_make,
                inv_model: itemData.inv_model,
                inv_year: itemData.inv_year,
                inv_description: itemData.inv_description,
                inv_image: itemData.inv_image,
                inv_thumbnail: itemData.inv_thumbnail,
                inv_price: itemData.inv_price,
                inv_miles: itemData.inv_miles,
                inv_color: itemData.inv_color,
                classification_id: itemData.classification_id
            })
    } catch (error) {
        req.flash("notice", "Sorry, there was an error.")
        res.redirect("/inv/")
    }    
}    


/* ***************************
 * Process Update Inventory
 ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    const {
        inv_id, 
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

    if(!inv_id) {
        req.flash("notice", "Invalid vehicle ID")
        return res.redirect("/inv/")
    }

    const classificationList = await utilities.buildClassificationList(classification_id)
    try {
        const updateVehicleResult = await invModel.updateInventory({
            inv_id: parseInt(inv_id),
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
        })

        if (updateVehicleResult) {
            const itemName = updateVehicleResult.inv_make + " " + updateVehicleResult.inv_model
            req.flash("notice", `The ${itemName} was updated successfully.`)
            res.redirect("/inv/")
        } else {
            const itemName = `${inv_make} ${inv_model}`
            req.flash("notice", "Sorry the update failed.")
            res.status(501).render("inventory/edit-inventory", {
                title: "Edit " + itemName,
                nav,
                classificationList,
                errors: null,
                inv_id,
                inv_make,
                inv_model,
                inv_year,
                inv_description,
                inv_image,
                inv_thumbnail,
                inv_price,
                inv_miles,
                inv_color,
                classification_id
            })
        }
    } catch (error) {
        req.flash("notice", "Sorry, there was an error updating the vehicle.")
        res.status(500).render("inventory/edit-inventory", {
            title: "Edit Vehicle",
            nav,
            classificationList,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
    }
}
   
module.exports = invCont
