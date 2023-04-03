const CryptoJS = require('crypto-js')
const Report = require('../model/reportModel')

const addPostRepost = async (req, res) => {
  try {
    const { id, reason } = req.body
    if (!id || !reason) {
      return res.json({
        code: 400,
        message: 'missing params',
      })
    }
    const idUser = JSON.parse(
      CryptoJS.AES.decrypt(
        req.headers.authorization,
        process.env.PRIVATE_KEY
      ).toString(CryptoJS.enc.Utf8)
    ).id
    const response = await Report.isReportedPost(idUser, id)
    if (response === 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    if (response.length > 0) {
      return res.json({
        code: 200,
        message: 'have reported',
      })
    }
    // const reason = req.body.reason
    const resAddReport = await Report.add({ reason, idUser, idPost: id })
    if (resAddReport === 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    return res.json({
      code: 201,
      message: 'reported',
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

const addCommentReport = async (req, res) => {
  try {
    const { id, reason } = req.body
    if (!id || !reason) {
      return res.json({
        code: 400,
        message: 'missing params',
      })
    }
    const idUser = JSON.parse(
      CryptoJS.AES.decrypt(
        req.headers.authorization,
        process.env.PRIVATE_KEY
      ).toString(CryptoJS.enc.Utf8)
    ).id
    const response = await Report.isReportedComment(idUser, id)
    if (response === 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    if (response.length > 0) {
      return res.json({
        code: 200,
        message: 'have reported',
      })
    }
    const responseAdd = await Report.add({ idUser, idComment: id, reason })
    if (responseAdd === 'fail') {
      return res.json({
        code: 50,
        message: 'error',
      })
    }
    return res.json({
      code: 201,
      message: 'reported',
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

module.exports = { addPostRepost, addCommentReport }
