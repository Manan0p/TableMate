import Table from '../models/Table.js';

/**
 * Retrieves all active tables sorted by capacity ascending.
 */
const getAllTables = async ({ includeInactive = false } = {}) => {
  const filter = includeInactive ? {} : { isActive: true };
  return Table.find(filter).sort({ capacity: 1, tableNumber: 1 });
};

/**
 * Retrieves a single table by ID.
 */
const getTableById = async (id) => {
  const table = await Table.findById(id);
  if (!table) {
    const error = new Error('Table not found.');
    error.statusCode = 404;
    throw error;
  }
  return table;
};

/**
 * Creates a new table after checking for duplicate table numbers.
 */
const createTable = async ({ tableNumber, capacity, isActive = true }) => {
  const existing = await Table.findOne({ tableNumber });
  if (existing) {
    const error = new Error(`Table number ${tableNumber} already exists.`);
    error.statusCode = 409;
    throw error;
  }
  return Table.create({ tableNumber, capacity, isActive });
};

/**
 * Updates a table by ID. Guards against duplicate table numbers.
 */
const updateTable = async (id, updates) => {
  if (updates.tableNumber !== undefined) {
    const existing = await Table.findOne({
      tableNumber: updates.tableNumber,
      _id: { $ne: id },
    });
    if (existing) {
      const error = new Error(`Table number ${updates.tableNumber} already exists.`);
      error.statusCode = 409;
      throw error;
    }
  }

  const table = await Table.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!table) {
    const error = new Error('Table not found.');
    error.statusCode = 404;
    throw error;
  }

  return table;
};

/**
 * Soft-deletes (deactivates) a table. Hard delete is also available via deleteTable.
 */
const deleteTable = async (id) => {
  const table = await Table.findByIdAndDelete(id);
  if (!table) {
    const error = new Error('Table not found.');
    error.statusCode = 404;
    throw error;
  }
  return table;
};

export default { getAllTables, getTableById, createTable, updateTable, deleteTable };
