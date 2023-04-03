const pool = require('../configs/connectDB')

const table = 'posts'
const Post = {
  async list(page, postsPerPage) {
    let qb
    try {
      qb = await pool.get_connection()
      let sql = `SELECT *, (SELECT name FROM users WHERE users.id = ${table}.id_author) AS name_author, (SELECT name FROM users WHERE users.id = ${table}.id_censor) AS name_censor FROM ${table} WHERE ${table}.deleted = 0 ORDER BY created_at DESC LIMIT ${postsPerPage} OFFSET ${
        (page - 1) * postsPerPage
      }`

      const response = await qb.query(sql)
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async get(id) {
    let qb
    try {
      let sql = `SELECT ${table}.* ,  categories.name AS category_name, users.name AS author_name FROM ${table} INNER JOIN categories ON ${table}.id_category = categories.id INNER JOIN users ON ${table}.id_author = users.id WHERE ${table}.id=${id} AND ${table}.deleted = 0 AND ${table}.id_censor IS NOT NULL`
      qb = await pool.get_connection()
      const response = await qb.query(sql)
      return response[0]
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async updateViewed(id, view) {
    let qb
    try {
      qb = await pool.get_connection()
      await qb.update(table, { viewed: view }, { id })
    } catch (error) {
    } finally {
      qb.release()
    }
  },
  async search(searchArr, type) {
    let qb
    try {
      qb = await pool.get_connection()

      const limitPost = 40
      let sql = `SELECT * FROM ${table} WHERE `
      const searchLen = searchArr.length
      for (let i in searchArr) {
        if (i == searchLen - 1) {
          sql += `title LIKE '%${searchArr[i]}%'`
        } else {
          sql += `title LIKE '%${searchArr[i]}%' AND `
        }
      }
      sql += `AND deleted = 0 AND id_censor IS NOT NULL `
      if (!type) {
        sql += ` ORDER BY created_at DESC LIMIT ${limitPost}`
      } else {
        sql += ` ORDER BY created_at DESC`
      }

      const response = qb.query(sql)

      return response
    } catch (error) {
      console.log(error)
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async new(num) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.query(
        `SELECT id,title,avartar_cdn, created_at FROM ${table} WHERE id_censor IS NOT null and deleted = 0 ORDER BY censored_at DESC LIMIT ${num}`
      )
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async add(data) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.insert(table, {
        ...data,
        created_at: Date.now(),
        viewed: 0,
      })
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async postOfCategory(id, page, postsPerPage) {
    let qb
    try {
      qb = await pool.get_connection()
      const sql = `SELECT ${table}.*, users.name AS name_author FROM ${table} INNER JOIN users ON users.id = ${table}.id_author WHERE ${table}.id_category = ${id} AND ${table}.deleted = 0 AND ${table}.id_censor IS NOT NULL ORDER BY ${table}.created_at DESC LIMIT ${postsPerPage} OFFSET ${
        (page - 1) * postsPerPage
      }`
      const response = await qb.query(sql)
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async getNumLike(type, id) {
    let qb
    try {
      qb = await pool.get_connection()
      let response = null
      if (type === 'post') {
        response = await qb.where('id_post', id).count('*')
      } else if (type === 'comment') {
        response = await qb.where('id_comment', id).count('*')
      }
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async isLikeByUser(type, id, idUser) {
    let qb
    try {
      qb = await pool.get_connection()
      let response = null
      if (type === 'post') {
        response = await qb.where('id_post', id).count('*')
      } else if (type === 'comment') {
        response = await qb.where('id_comment', id).count('*')
      }
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async generateFakePostData(data) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.insert(table, data)
      // return response
    } catch (error) {
      // return 'fail'
    } finally {
      qb.release()
    }
  },
  async getNumPostOfCategory(id) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.query(
        'SELECT COUNT(*) AS numrows FROM posts WHERE id_category = ' + id
      )
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async getNumPost() {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.query('SELECT COUNT(*) AS numrows FROM posts')
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async delete(id) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.update(table, { deleted: 1 }, { id })
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async listOfcategoryHome(idCategory) {
    let qb
    try {
      qb = await pool.get_connection()
      let sql = ''
      for (let i = 0; i < idCategory.length; i++) {
        if (i === 0) {
          sql += `(SELECT ${table}.*, categories.name as name_category FROM ${table} INNER JOIN categories ON categories.id = ${table}.id_category WHERE ${table}.id_category = ${idCategory[i]} AND ${table}.deleted = 0 AND ${table}.id_censor IS NOT NULL AND categories.status = 0 ORDER BY ${table}.created_at DESC LIMIT 10 )`
        } else {
          sql += ` UNION ALL (SELECT ${table}.*, categories.name as name_category FROM ${table} INNER JOIN categories ON categories.id = ${table}.id_category WHERE ${table}.id_category = ${idCategory[i]} AND ${table}.deleted = 0 AND ${table}.id_censor IS NOT NULL AND categories.status = 0 ORDER BY ${table}.created_at DESC LIMIT 10 )`
        }
      }
      const response = await qb.query(sql)
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async trash() {
    let qb
    try {
      qb = await pool.get_connection()

      const response = await qb.query(
        `SELECT *,(SELECT name from users WHERE posts.id_author = users.id)  AS name_author, (SELECT name FROM users WHERE users.id = posts.id_censor) AS name_censor FROM posts WHERE deleted = 1 ORDER BY created_at DESC`
      )

      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async restore(idPost) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.update(
        table,
        {
          deleted: 0,
        },
        { id: idPost }
      )
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async forceDelete(idPost) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.delete(table, {
        id: idPost,
      })
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async getSpecial(idUser, role) {
    let qb
    try {
      qb = await pool.get_connection()
      let sql
      if (role === 1) {
        sql = `SELECT *, (SELECT name FROM users WHERE users.id = ${table}.id_author) AS name_author, (SELECT name FROM users WHERE users.id = ${table}.id_censor) AS name_censor FROM ${table} WHERE ${table}.id_author = ${idUser} AND ${table}.deleted = 0 ORDER BY created_at DESC `
      } else if (role === 2) {
        sql = `SELECT *, (SELECT name FROM users WHERE users.id = ${table}.id_author) AS name_author, (SELECT name FROM users WHERE users.id = ${table}.id_censor) AS name_censor FROM ${table} WHERE ${table}.id_censor IS NULL AND ${table}.deleted = 0 ORDER BY created_at DESC `
      } else return 'fail'

      const response = await qb.query(sql)
      return response
    } catch (error) {
    } finally {
      qb.release()
    }
  },
  async deleteUnCensor(idUser, idPost) {
    let qb
    try {
      qb = await pool.get_connection()
      const sql = `DELETE FROM ${table} WHERE id = ${idPost} AND id_author = ${idUser} AND id_censor IS NULL`
      const response = await qb.query(sql)
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async getUncensorPost(idUser, idPost) {
    let qb
    try {
      qb = await pool.get_connection()
      const sql = `SELECT * FROM ${table} WHERE id = ${idPost} AND id_author = ${idUser} AND id_censor IS NULL`
      const response = await qb.query(sql)
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async update({
    id,
    title,
    sort_description,
    id_category,
    content,
    avartar_cdn,
    id_censor,
    censored_at,
    updated_at,
  }) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.update(
        table,
        {
          title,
          sort_description,
          id_category,
          content,
          avartar_cdn,
          id_censor,
          censored_at,
          updated_at,
        },
        { id }
      )
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
}

module.exports = Post
