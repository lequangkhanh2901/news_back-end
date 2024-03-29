const express = require('express')

const { authMiddleware } = require('../middleware/userMiddleware')
const {
  addPostRepost,
  addCommentReport,
} = require('../controler/reportController')

let router = express.Router()

const reportRoutes = (app) => {
  router.post('/post', authMiddleware, addPostRepost)
  router.post('/comment', authMiddleware, addCommentReport)
  return app.use('/api/report', router)
}

module.exports = reportRoutes
