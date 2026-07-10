import { body, param } from 'express-validator';

export const createTableValidator = [
  body('tableNumber')
    .notEmpty().withMessage('Table number is required.')
    .isInt({ min: 1 }).withMessage('Table number must be a positive integer.'),

  body('capacity')
    .notEmpty().withMessage('Capacity is required.')
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1.')
    .isInt({ max: 50 }).withMessage('Capacity cannot exceed 50.'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean value.'),
];

export const updateTableValidator = [
  param('id')
    .isMongoId().withMessage('Invalid table ID.'),

  body('tableNumber')
    .optional()
    .isInt({ min: 1 }).withMessage('Table number must be a positive integer.'),

  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1.')
    .isInt({ max: 50 }).withMessage('Capacity cannot exceed 50.'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean value.'),
];

export const tableIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid table ID.'),
];
