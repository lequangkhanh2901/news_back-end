const CryptoJS = require('crypto-js')
const Comment = require('../model/commentModel')
const LikeComment = require('../model/likeCommentModel')

const addComment = async (req, res) => {
  try {
    console.log(req.body)
    const { idPost, comment, idParentComment } = req.body
    if (!idPost || !comment) {
      return res.json({ code: 400, message: 'missing params' })
    }
    const { id } = JSON.parse(
      CryptoJS.AES.decrypt(
        req.headers.authorization,
        process.env.PRIVATE_KEY
      ).toString(CryptoJS.enc.Utf8)
    )
    const response = await Comment.add(id, idPost, idParentComment, comment)
    if (response !== 'fail') {
      return res.json({
        code: 201,
        message: 'ok',
      })
    }
    return res.json({
      code: 500,
      message: 'error',
    })
  } catch (error) {
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}

const getListComment = async (req, res) => {
  try {
    let idUser = 0
    const { id } = req.params
    if (!id) {
      return res.json({ code: 400, message: 'missing params' })
    }
    if (req.headers.authorization) {
      idUser = JSON.parse(
        CryptoJS.AES.decrypt(
          req.headers.authorization,
          process.env.PRIVATE_KEY
        ).toString(CryptoJS.enc.Utf8)
      ).id
    }
    const response = await Comment.listOfPost(id, idUser)
    if (response === 'fail') {
      return res.json({ code: 500, message: 'error' })
    }
    return res.json({ code: 200, message: 'ok', data: response })
  } catch (error) {}
}
const likeComment = async (req, res) => {
  try {
    const idComment = req.body.id
    if (!idComment) {
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
    const response = await LikeComment.checkLiked(idUser, idComment)
    if (response.length === 0) {
      const resLike = await LikeComment.add(idUser, idComment)
      if (resLike === 'fail') {
        return res.json({
          code: 500,
          message: 'error',
        })
      }
      return res.json({
        code: 201,
        message: 'liked',
      })
    }
    const resUnlike = await LikeComment.delete(idUser, idComment)
    if (resUnlike === 'fail') {
      return res.json({
        code: 500,
        message: 'error',
      })
    }
    return res.json({
      code: 200,
      message: 'unliked',
    })
  } catch (error) {
    console.log('loi con', error)
    return res.json({
      code: 500,
      message: 'error',
    })
  }
}
module.exports = { addComment, getListComment, likeComment }
