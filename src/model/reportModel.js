const pool = require('../configs/connectDB')
const table = 'reports'

const Report = {
  async isReportedPost(idUser, idPost) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb
        .where({ id_post: idPost, id_user: idUser })
        .get(table)
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async add({ idUser, idPost, idComment, reason }) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.insert(table, {
        id_user: idUser,
        id_post: idPost,
        id_comment: idComment,
        reason,
        created_at: Date.now(),
        status: 0,
      })
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async isReportedComment(idUser, idComment) {
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
}

module.exports = Report
