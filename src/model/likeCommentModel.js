const pool = require('../configs/connectDB')

const table = 'likes_comment'

const LikeComment = {
  async checkLiked(idUser, idComment) {
    let qb
    try {
      qb = await pool.get_connection()

      const response = await qb
        .where({ id_comment: idComment, id_user: idUser })
        .get(table)

      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async add(idUser, idComment) {
    let qb
    try {
      qb = await pool.get_connection()

      const response = await qb.insert(table, {
        id_user: idUser,
        id_comment: idComment,
      })

      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async delete(idUser, idComment) {
    let qb
    try {
      qb = await pool.get_connection()

      const response = await qb.delete(table, {
        id_user: idUser,
        id_comment: idComment,
      })
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
}

module.exports = LikeComment
