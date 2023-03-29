const express = require('express')
const multer = require('multer')
const CryptoJS = require('crypto-js')

const {
  addUser,
  login,
  updateUser,
  userRegister,
  loginToken,
  changeAvatar,
  listUser,
  forceUpdateUser,
} = require('../controler/userController')
const { userValidator } = require('../middleware/validator')
const { authMiddleware, checkAdmin } = require('../middleware/userMiddleware')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname.replace('routes', '') + '/public/images/avartarUser')
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
// const MultipartyChangeAvatarUserMiddleware = multiparty({ uploadDir: __dirname + '/public/images/avartarUser' })

let router = express.Router()

const userRoutes = (app) => {
  router.get('/list', authMiddleware, checkAdmin, listUser)
  router.post('/', userValidator.signUp, addUser)
  router.patch('/', userValidator.update, authMiddleware, updateUser)
  router.post('/login', userValidator.login, login)
  router.post('/login-token', authMiddleware, loginToken)
  router.patch('/force', authMiddleware, checkAdmin, forceUpdateUser)
  router.post(
    '/change-avartar',
    authMiddleware,
    upload.single('file'),
    changeAvatar
  )
  router.get('/user-register/:token', userRegister)

  return app.use('/api/user', router)
}

module.exports = userRoutes
