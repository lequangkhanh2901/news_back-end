const express = require('express')

const {
  getListCategory,
  addCategory,
  deleteCategory,
  updateCategory,
  trashCategory,
  forceDeleteCategory,
} = require('../controler/categoryController')
const { checkAdmin, authMiddleware } = require('../middleware/userMiddleware')

let router = express.Router()

const categoryRoutes = (app) => {
  router.get('/', getListCategory)
  router.get('/trash', authMiddleware, checkAdmin, trashCategory)
  router.post('/', authMiddleware, checkAdmin, addCategory)
  router.delete('/', authMiddleware, checkAdmin, deleteCategory)
  router.delete('/force', authMiddleware, checkAdmin, forceDeleteCategory)
  router.patch('/', authMiddleware, checkAdmin, updateCategory)
  return app.use('/api/category', router)
}

module.exports = categoryRoutes
