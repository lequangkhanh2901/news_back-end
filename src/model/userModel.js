const pool = require('../configs/connectDB')
const CryptoJS = require('crypto-js')

const table = 'users'

const User = {
  // get role
  async add({ name, email, password }) {
    let qb
    try {
      password = CryptoJS.AES.encrypt(
        password,
        process.env.PRIVATE_KEY
      ).toString()
      qb = await pool.get_connection()
      const response = await qb.insert(table, {
        name,
        email,
        password,
        role: 3,
        created_at: Date.now(),
      })
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async isExist(email) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.query(
        `SELECT COUNT(*) as count FROM users WHERE email LIKE '${email}'`
      )
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async getLogin(email) {
    let qb
    try {
      qb = await pool.get_connection()
      const [response] = await qb
        .select('id, email, password, role, name, avartar_cdn, status')
        .where({ email })
        .get(table)
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async update({ id, name, avartar_cdn }) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.update(
        table,
        {
          name,
          avartar_cdn,
          updated_at: Date.now(),
        },
        {
          id,
          'status !=': 1,
        }
      )

      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async list() {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.where('role !=', 0).get(table)
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async forceUpdate(id, type) {
    let qb
    try {
      qb = await pool.get_connection()
      let response
      if (type === 'BAN') {
        response = await qb.update(table, { status: 1 }, { id })
      } else if (type === 'UNLOCK') {
        response = await qb.update(table, { status: 0 }, { id })
      } else {
        response = 'invalid action'
      }
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async get(idUser) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.where('id', idUser).get(table)
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async changePassword(idUser, newPass) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.update(
        table,
        {
          password: newPass,
        },
        {
          id: idUser,
        }
      )
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async changeRole(id, role) {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.update(
        table,
        {
          role: role,
        },
        {
          id: id,
        }
      )
      console.log(response)
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
}

module.exports = User
