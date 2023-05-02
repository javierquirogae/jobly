// Import the BadRequestError from the '../expressError' module
const { BadRequestError } = require("../expressError");

/**
 * Generate an SQL query for updating a table in a PostgreSQL database, based on the data to be updated.
 *
 * @param {object} dataToUpdate - An object that contains the data to be updated. 
 *                  The keys of this object represent the column names in the table, 
 *                  and the values represent the new values to be set.
 * @param {object} [jsToSql] - An optional object that maps JavaScript-style column names 
 *                  to their corresponding column names in the SQL table. 
 *                  If a column name is not found in this object, the JavaScript-style name will be used.
 *
 * @returns {object} An object with two properties:
 *   - `setCols`: a string representing the SQL SET clause of the query
 *   - `values`: an array of values to be used in the SQL query
 *
 * @throws {BadRequestError} If the `dataToUpdate` object is empty
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // Get the keys of the `dataToUpdate` object
  const keys = Object.keys(dataToUpdate);

  // If there are no keys, throw a BadRequestError
  if (keys.length === 0) throw new BadRequestError("No data");

  // Create an array of strings representing the SQL columns to be updated
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // Return an object with the `setCols` and `values` properties
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

// Export the `sqlForPartialUpdate` function
module.exports = { sqlForPartialUpdate };

