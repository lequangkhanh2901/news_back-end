const express = require('express')

let router = express.Router()

const categoryRoutes = (app) => {
  router.get('/', () => {})

  return app.use('/api/like-post', router)
}

module.exports = categoryRoutes
