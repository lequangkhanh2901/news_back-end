const express = require('express')
const {
  addComment,
  getListComment,
  likeComment,
} = require('../controler/commentController')

const { authMiddleware } = require('../middleware/userMiddleware')

let router = express.Router()

const commentRoutes = (app) => {
  router.post('/', authMiddleware, addComment)
  router.get('/of-post/:id', getListComment)
  router.post('/like', authMiddleware, likeComment)
  return app.use('/api/comment', router)
}

module.exports = commentRoutes
