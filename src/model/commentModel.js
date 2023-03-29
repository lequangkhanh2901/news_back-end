const pool = require('../configs/connectDB')

const table = 'comments'

const Comment = {
  async add(idUser, idPost, idPerentComment, comment) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.insert(table, {
        id_user: idUser,
        id_post: idPost,
        content: comment,
        id_parent_comment: idPerentComment,
        created_at: Date.now(),
      })
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async listOfPost(idPost, idUser) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.query(
        `SELECT ${table}.*, users.name AS user_name, (SELECT COUNT(*) FROM likes_comment WHERE likes_comment.id_comment = ${table}.id) AS numlike, (SELECT COUNT(*) FROM likes_comment WHERE likes_comment.id_user = ${idUser} AND ${table}.id =  likes_comment.id_comment) AS isLikeByUser FROM ${table} INNER JOIN users ON users.id = ${table}.id_user WHERE ${table}.id_post = ${idPost} ORDER BY ${table}.id DESC`
      )
      return response
    } catch (error) {
      console.log(error)
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async checkLiked(idUser, idComment) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.query(
        `SELECT COUNT(*) as is_like from likes_comment WHERE id_user = ${idUser} AND id_comment = ${idComment}`
      )
      return response
    } catch (error) {
      console.log('loi midel', error)
      return 'fail'
    } finally {
      qb.release()
    }
  },
}

module.exports = Comment
