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

// Route for getInventory by classification_id
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route for editing inventory view
router.get("/edit/:inv_id", utilities.handleErrors(invController.buildEditInventory))

// Route for processing update inventory
router.post("/edit-inventory",
    validate.addNewInventoryRules(),
    validate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory))

// Route for delete view
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteConfirm))

// Route for processing delete inventory
router.post("/delete-confirm",
    validate.deleteRules(),
    validate.checkDeleteData,
    utilities.handleErrors(invController.deleteConfirm)
)

module.exports = router;