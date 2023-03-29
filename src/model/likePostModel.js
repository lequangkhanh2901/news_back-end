const pool = require('../configs/connectDB')

const table = 'likes_post'

const LikePostModel = {
  async getNum(id) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.query(
        `SELECT COUNT(*) AS num_like FROM ${table} WHERE id_post = ${id}`
      )
      return response[0].num_like
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async isLikeByUser(idUser, idPost) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb
        // query(
        //   `SELECT id AS idLike FROM ${table} WHERE id_user = ${idUser} AND id_post = ${idPost}`
        // )
        .select('id AS idLike')
        .from(table)
        .where({ id_user: idUser, id_post: idPost })
        .get()

      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async like(idUser, idPost) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.insert(table, {
        id_user: idUser,
        id_post: idPost,
      })

      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async unLike(id) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.delete(table, { id })

      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
}

module.exports = LikePostModel
