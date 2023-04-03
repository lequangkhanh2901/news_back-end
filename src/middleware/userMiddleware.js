const User = require('../model/userModel')
const CryptoJS = require('crypto-js')

const checkAdmin = async (req, res, next) => {
  try {
    const { authorization } = req.headers
    const { role } = JSON.parse(
      CryptoJS.AES.decrypt(authorization, process.env.PRIVATE_KEY).toString(
        CryptoJS.enc.Utf8
      )
    )
    if (role != 0) {
      return res.json({
        code: 301,
        message: 'invalid user',
      })
    }
    next()
  } catch (error) {
    return res.json({
      code: 400,
      message: 'error',
    })
  }
}

const authMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers
    if (!authorization) {
      return res.json({
        code: 300,
        message: 'missing token',
      })
    }
    next()
  } catch (error) {
    return res.json({
      code: 500,
      messgae: 'error',
    })
  }
}
const writerMiddleWare = (req, res, next) => {
  try {
    const { authorization } = req.headers
    const { role } = JSON.parse(
      CryptoJS.AES.decrypt(authorization, process.env.PRIVATE_KEY).toString(
        CryptoJS.enc.Utf8
      )
    )
    if (role != 1) {
      return req.json({
        code: 404,
        message: 'permision denied',
      })
    }
    next()
  } catch (error) {
    return res.json({
      code: 405,
      message: 'error',
    })
  }
}

const censorMiddleware = (req, res, next) => {
  try {
    const { authorization } = req.headers
    const { role } = JSON.parse(
      CryptoJS.AES.decrypt(authorization, process.env.PRIVATE_KEY).toString(
        CryptoJS.enc.Utf8
      )
    )
    if (role != 2) {
      return req.json({
        code: 404,
        message: 'permision denied',
      })
    }
    next()
  } catch (error) {
    return res.json({
      code: 405,
      message: 'error',
    })
  }
}

module.exports = {
  checkAdmin,
  authMiddleware,
  writerMiddleWare,
  censorMiddleware,
}
