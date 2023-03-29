const express = require('express')

const {
  getPosts,
  getPost,
  getSearch,
  getNew,
  add,
  getPostOfcategory,
  generatepost,
  deletePost,
  likePost,
} = require('../controler/postController')
const {
  authMiddleware,
  writerMiddleWare,
  checkAdmin,
} = require('../middleware/userMiddleware')

let router = express.Router()

const postRoutes = (app) => {
  router.get('/list/:page?', getPosts)
  router.get('/new', getNew)
  router.get('/generate-post', generatepost)
  router.get('/:id', getPost)
  router.get('/search/:searchData', getSearch)
  router.get('/of-category/:id/:page?', getPostOfcategory)
  router.post('/', add)
  router.post('/like', authMiddleware, likePost)
  router.delete('/', authMiddleware, checkAdmin, deletePost)
  return app.use('/api/post', router)
}

module.exports = postRoutes
