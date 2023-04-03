const express = require('express')
const multer = require('multer')
const CryptoJS = require('crypto-js')

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
  getHomePosts,
  getTrashPost,
  restorePost,
  forceDeletePost,
  getPostsSpecial,
  deleteUnCensorPost,
  getUncensorPost,
  updatePost,
  censorPost,
  getSearchAll,
} = require('../controler/postController')
const {
  authMiddleware,
  writerMiddleWare,
  checkAdmin,
  censorMiddleware,
} = require('../middleware/userMiddleware')

let router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname.replace('routes', '') + '/public/images/avartarPost')
  },
  filename: function (req, file, cb) {
    try {
      const { id } = JSON.parse(
        CryptoJS.AES.decrypt(
          req.headers.authorization,
          process.env.PRIVATE_KEY
        ).toString(CryptoJS.enc.Utf8)
      )
      cb(null, `${id}-${Date.now()}.jpg`) //Appending .jpg
    } catch (error) {}
  },
})

const upload = multer({ storage, limits: { fileSize: 500000 } })

const postRoutes = (app) => {
  router.get('/list/:page?', getPosts)
  router.get('/list-special', authMiddleware, getPostsSpecial)
  router.get('/new', getNew)
  router.get('/home', getHomePosts)
  router.get('/generate-post', generatepost)
  router.get('/search/:searchData', getSearch)
  router.get('/search-all/:data', getSearchAll)
  router.get('/of-category/:id/:page?', getPostOfcategory)
  router.get('/trash/:page?', authMiddleware, checkAdmin, getTrashPost)
  router.post('/restore', authMiddleware, checkAdmin, restorePost)
  router.post('/censor', authMiddleware, censorMiddleware, censorPost)
  router.get(
    '/un-censor/:id',
    authMiddleware,
    writerMiddleWare,
    getUncensorPost
  )
  router.post(
    '/update',
    authMiddleware,
    writerMiddleWare,
    upload.single('file'),
    updatePost
  )
  router.post('/like', authMiddleware, likePost)
  router.delete('/force', authMiddleware, checkAdmin, forceDeletePost)
  router.get('/:id', getPost)
  router.post('/', authMiddleware, writerMiddleWare, add)
  router.delete(
    '/un-censored',
    authMiddleware,
    writerMiddleWare,
    deleteUnCensorPost
  )
  router.delete('/', authMiddleware, checkAdmin, deletePost)
  return app.use('/api/post', router)
}

module.exports = postRoutes
