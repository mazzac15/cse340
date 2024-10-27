const pool = require("../database/")
const invModel = {}

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}
/* ***************************
 *  Get all inventory details for single view
 * ************************** */
async function getInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInvId error " + error)
  }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *`
    const name = await pool.query(sql, [classification_name])
    return name.rows[0]
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Add new inventory
 * ************************** */
async function addInventory(vehicleData) {
  try {
     // Log the values being inserted for debugging
     console.log("Attempting to insert:", {
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
    const sql = `INSERT INTO inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`
    const addVehicleResult = await pool.query(sql, [
      vehicleData.inv_make, 
      vehicleData.inv_model, 
      vehicleData.inv_description, 
      vehicleData.inv_image, 
      vehicleData.inv_thumbnail, 
      vehicleData.inv_price, 
      vehicleData.inv_year, 
      vehicleData.inv_miles, 
      vehicleData.inv_color, 
      vehicleData.classification_id])
    return addVehicleResult.rows[0];
  } catch (error) {

    console.error("error in addInventory:", error) //debugging

    throw error
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getInvId, addClassification, addInventory};
