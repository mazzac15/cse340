// Needed Resources 
const utilities = require("../utilities/")
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const validate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route for single inventory item details
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// Routes for management to add inventory
router.get("/", utilities.handleErrors(invController.buildManagement)); 

// Route for adding new classification
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// Route for processing new classification
router.post("/add-classification",
    validate.addNewClassificationRules(),
    validate.checkClassificationData,
    utilities.handleErrors(invController.processAddClassification))

// Route for adding new inventory
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

//Route for processing new inventory
router.post("/add-inventory",
    validate.addNewInventoryRules(),
    validate.checkNewInventoryData,
    utilities.handleErrors(invController.processAddInventory)
)

    module.exports = router;