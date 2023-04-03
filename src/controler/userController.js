const CryptoJS = require('crypto-js')
const fs = require('fs')

const User = require('../model/userModel')
const { registerMail } = require('../mailer/mail')
const { response } = require('express')

const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const isExistUser = await User.isExist(email)
    if (isExistUser === 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    const [{ count }] = isExistUser
    if (count > 0) {
      return res.json({
        code: 305,
        message: 'existed user',
      })
    }
    const verifyToken = CryptoJS.AES.encrypt(
      JSON.stringify({ name, email, password }),
      process.env.PRIVATE_KEY
    ).toString()

    const sendMailResult = await registerMail(
      email,
      verifyToken,
      req.headers.origin
    )
    if (sendMailResult == 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    return res.json({
      code: 201,
      message: 'an email was sent',
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

const userRegister = async (req, res) => {
  try {
    const token = req.body.token
    const { name, email, password } = JSON.parse(
      CryptoJS.AES.decrypt(token, process.env.PRIVATE_KEY).toString(
        CryptoJS.enc.Utf8
      )
    )
    const isExistUser = await User.isExist(email)
    if (isExistUser === 'fail') {
      throw new Error('error')
    }
    const [{ count }] = isExistUser
    if (count > 0) {
      return res.json({
        code: 300,
        message: 'existed user',
      })
    }
    const response = await User.add({ name, email, password })
    if (response == 'fail') {
      throw new Error('error')
    }
    return res.json({
      code: 201,
      message: 'ok',
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const response = await User.getLogin(email)
    if (response === 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    if (response === undefined) {
      return res.json({
        code: 401,
        message: 'wrong email',
      })
    }
    const pass = CryptoJS.AES.decrypt(
      response.password,
      process.env.PRIVATE_KEY
    ).toString(CryptoJS.enc.Utf8)
    if (pass == password) {
      if (response.status == 1) {
        return res.json({
          code: 204,
          message: 'account banned',
        })
      }
      const tokenStr = CryptoJS.AES.encrypt(
        JSON.stringify({
          id: response.id,
          email: response.email,
          role: response.role,
        }),
        process.env.PRIVATE_KEY
      ).toString()
      const data = {
        id: response.id,
        token: tokenStr,
        name: response.name,
        avartar_cdn: process.env.APP_CDN_URL + response.avartar_cdn,
      }
      if (response.role != 3) {
        data.role = response.role
      }
      return res.json({
        code: 201,
        message: 'success',
        data,
      })
    }
    return res.json({
      code: 302,
      message: 'wrong password',
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = JSON.parse(
      CryptoJS.AES.decrypt(
        req.headers.authorization,
        process.env.PRIVATE_KEY
      ).toString(CryptoJS.enc.Utf8)
    )
    const { name } = req.body
    const response = await User.update({ id, name })
    if (response === 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    return res.json({
      code: 201,
      message: 'ok',
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}
const loginToken = async (req, res) => {
  try {
    const { id, email } = JSON.parse(
      CryptoJS.AES.decrypt(
        req.headers.authorization,
        process.env.PRIVATE_KEY
      ).toString(CryptoJS.enc.Utf8)
    )
    const response = await User.getLogin(email)
    if (response === 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    if (Object.keys(response).length > 0) {
      if (response.status == 1) {
        return res.json({
          code: 500,
          message: 'banned',
        })
      }
      const tokenStr = CryptoJS.AES.encrypt(
        JSON.stringify({
          id: response.id,
          email: response.email,
          role: response.role,
        }),
        process.env.PRIVATE_KEY
      ).toString()
      const data = {
        id: response.id,
        token: tokenStr,
        name: response.name,
      }
      if (response.avartar_cdn) {
        data.avartar_cdn = process.env.APP_CDN_URL + response.avartar_cdn
      } else {
        data.avartar_cdn = ''
      }
      if (response.role != 3) {
        data.role = response.role
      }
      return res.json({
        code: 200,
        message: 'ok',
        data: data,
      })
    }
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

const changeAvatar = async (req, res) => {
  try {
    const { id } = JSON.parse(
      CryptoJS.AES.decrypt(
        req.headers.authorization,
        process.env.PRIVATE_KEY
      ).toString(CryptoJS.enc.Utf8)
    )
    const response = await User.update({
      id,
      avartar_cdn: '/images/avartarUser/' + req.file.filename,
    })
    if (response === 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    try {
      fs.unlink(
        __dirname.replace('controler', 'public') +
          req.body.previousCDN.replace(process.env.APP_CDN_URL, ''),
        (err) => {}
      )
    } catch (error) {}
    return res.json({
      code: 201,
      message: 'ok',
      data:
        process.env.APP_CDN_URL + '/images/avartarUser/' + req.file.filename,
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

const listUser = async (req, res) => {
  try {
    const response = await User.list()
    response.forEach((user) => {
      delete user.password
    })
    return res.json({
      code: 200,
      message: 'ok',
      data: response,
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}
const forceUpdateUser = async (req, res) => {
  try {
    const { id, type } = req.body
    if (!id || !type) {
      return res.json({
        code: 400,
        message: 'missing params',
      })
    }
    const response = await User.forceUpdate(id, type)
    if (response === 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    if (response === 'invalid action') {
      return res.json({
        code: 401,
        message: 'INVALID_ACTION',
      })
    }
    if (type === 'BAN') {
      global.io.emit(id, 'BAN')
    }
    return res.json({
      code: 201,
      message: 'ok',
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}
const changePassword = async (req, res) => {
  try {
    const { newPassword, oldPassword } = req.body
    if (newPassword === oldPassword) {
      return res.json({
        code: 402,
        message: 'same pass',
      })
    }

    const idUser = JSON.parse(
      CryptoJS.AES.decrypt(
        req.headers.authorization,
        process.env.PRIVATE_KEY
      ).toString(CryptoJS.enc.Utf8)
    ).id

    const response = await User.get(idUser)
    if (response === 'fail') {
      throw new Error('error')
    }
    if (response.length === 0) {
      return res.json({
        code: 404,
        message: 'non exist user',
      })
    }
    const currentPass = CryptoJS.AES.decrypt(
      response[0].password,
      process.env.PRIVATE_KEY
    ).toString(CryptoJS.enc.Utf8)
    if (currentPass !== oldPassword) {
      return res.json({ code: 400, message: 'oldPass is wrong' })
    }
    const responseChangePass = await User.changePassword(
      idUser,
      CryptoJS.AES.encrypt(newPassword, process.env.PRIVATE_KEY).toString()
    )
    if (responseChangePass === 'fail') {
      throw new Error('error')
    }
    return res.json({
      code: 200,
      message: 'changed',
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

const getUserByAdmin = async (req, res) => {
  try {
    const idUser = req.params.id
    if (!idUser) {
      return res.json({
        code: 400,
        message: 'missing params',
      })
    }

    const response = await User.get(idUser)
    if (response === 'fail') {
      throw new Error('error')
    }
    const user = response[0]
    delete user.password
    if (user.avartar_cdn) {
      user.avartar_cdn = process.env.APP_CDN_URL + user.avartar_cdn
    }
    return res.json({
      code: 200,
      message: 'ok',
      data: user,
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

const changeRole = async (req, res) => {
  try {
    const { id, role } = req.body
    console.log(req.body)

    if (!id || !role) {
      return res.json({ code: 400, message: 'missing params' })
    }
    const response = await User.changeRole(id, role)
    if (response === 'fail') {
      throw new Error('error')
    }

    return res.json({ code: 200, message: 'changed' })
  } catch (error) {
    console.log(error)
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

module.exports = {
  addUser,
  login,
  updateUser,
  userRegister,
  loginToken,
  changeAvatar,
  listUser,
  forceUpdateUser,
  changePassword,
  getUserByAdmin,
  changeRole,
}
