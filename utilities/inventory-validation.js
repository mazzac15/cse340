const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")

/*  **********************************
*  New Classification Name Validation Rules
* ********************************* */
validate.addNewClassificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isAlpha()
            .withMessage("Classification name is required and must be all letters.")
    ]
}

/* **********************************************************
 * Check data and return errors or continue to classification
 * ******************************************************* */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
            classification_name,
        })
        return;
    }
    next()
}

/* ******************************
 * Add new inventory rulles
 * ***************************** */
validate.addNewInventoryRules = () => {
    return [
        //must select classification
        body("classification_id")
            .trim()
            .escape()
            .notEmpty().withMessage("A classification must be selected.")
            .bail(),

        //make is required and must be a string
        body("inv_make")
            .trim()
            .escape()
            .notEmpty().withMessage("Make is required.")
            .bail()
            .isLength({ min: 3 }).withMessage("Make must be a minimum of 3 characters.")
            .bail(),
        
        //model is requied and must be a string
        body("inv_model")
            .trim()
            .escape()
            .notEmpty().withMessage("Model is required.")
            .bail()
            .isLength({ min: 3 }).withMessage("Model must be a minimum of 3 characters.")
            .bail(),

        //description is required
        body("inv_description")
            .trim()
            .escape()
            .notEmpty().withMessage("Must include a description.")
            .bail(),
        
        //image path is required
        body("inv_image")
            .trim()
            .escape()
            .notEmpty().withMessage("Image path is required.")
            .bail(),

        //image thumbnail is required
        body("inv_thumbnail")
            .trim()
            .escape()
            .notEmpty().withMessage("Image thumbnail is required.")
            .bail(),

        //price is required and should only include digits
        body("inv_price")
            .trim()
            .escape()
            .notEmpty().withMessage("Price is required and should only include digits.")
            .bail()
            .isNumeric().withMessage("Price is required and should only include digits.")
            .bail(),

        //year is required and should be 4 digits
        body("inv_year")
            .trim()
            .escape()
            .notEmpty().withMessage("A 4 digit year is required.")
            .bail()
            .isLength({ min: 4, max: 4 }).withMessage("A 4 digit year is required.")
            .bail()
            .isNumeric().withMessage("Must only contain numbers.")
            .bail(),

        //miles are required    
        body("inv_miles")
            .trim()
            .escape()
            .notEmpty().withMessage("Miles are required.")
            .bail()
            .isNumeric().withMessage("Must only contain numbers.")
            .bail(),

        //color is required
        body("inv_color")
            .trim()
            .escape()
            .notEmpty().withMessage("Color is required.")
            .bail(),
        ]
}

/* **********************************************************
 * Check data and return errors or continue to classification
 * ******************************************************* */
validate.checkNewInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "Add Vehicle",
            nav,
            classificationList,
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
        return;
    }
    next()
}

/* *****************************************************
 * Check data and return errors or continue to edit view
 * ************************************************** */
validate.checkUpdateData = async (req, res, next) => {
    const { inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/edit-inventory", {
            errors,
            title: "Edit Vehicle",
            nav,
            classificationList,
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
        })
        return;
    }
    next()
}


/* ***************************
 * Delete validation rules
 * ************************** */
validate.deleteRules = () => {
    return [
        body("inv_id")
        .trim()
        .isNumeric()
        .withMessage("Invalid vehicle ID.")
        .bail()
        .notEmpty()
        .withMessage("Vehicle ID is required.")
        .bail()
    ]
}

/* *****************************************************
 * check delete data and return errors
 * ************************************************** */
validate.checkDeleteData = async (req, res, next) => {
    const { inv_id } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const itemData = await invModel.getInvId(parseInt(inv_id))
        res.render("inventory/delete-confirm", {
            errors,
            title: "Delete Vehicle",
            nav,
            inv_id: itemData.inv_id,
            inv_make: itemData.inv_make,
            inv_model: itemData.inv_model,
            inv_year: itemData.inv_year,
            inv_price: itemData.inv_price
        })
        return;
    }
    next()
}

module.exports = validate