import express from 'express';
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
} from '../controllers/table.controller.js';
import { createTableValidator, updateTableValidator, tableIdValidator } from '../validators/table.validators.js';
import authenticate from '../middleware/auth.js';
import { adminOnly } from '../middleware/roles.js';

const router = express.Router();

// GET /tables — available to any authenticated user
router.get('/', authenticate, getTables);

// Write operations — admin only
router.post('/', authenticate, adminOnly, createTableValidator, createTable);
router.put('/:id', authenticate, adminOnly, updateTableValidator, updateTable);
router.delete('/:id', authenticate, adminOnly, tableIdValidator, deleteTable);

export default router;
