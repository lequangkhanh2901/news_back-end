const pool = require('../configs/connectDB')

const table = 'categories'
const Category = {
  async list() {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.select(['id', 'name', 'status', 'id_parent_category']).where('status', 0).get(table)

      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
    // finally {
    //
    // }
  },
  async add(name, idParent = null) {
    let qb
    try {
      qb = await pool.get_connection()

      const response = await qb.insert(table, {
        name: name,
        id_parent_category: idParent,
        status: 0,
        created_at: Date.now(),
      })

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
      const response = await qb.update(table, { status: 1 }, { id })
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async update({ id, name, status, idParentCategory = null }) {
    let qb
    try {
      qb = await pool.get_connection()
      let data = { name, id_parent_category: idParentCategory, updated_at: Date.now() }
      if (status) {
        data = {
          status,
          id_parent_category: idParentCategory,
          updated_at: Date.now(),
        }
      }
      const response = await qb.update(
        table,
        {
          name,
          status,
          id_parent_category: idParentCategory,
          updated_at: Date.now(),
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
  async trash() {
    let qb
    try {
      qb = await pool.get_connection()
      const response = await qb.select(['id', 'name']).where('status', 1).get(table)
      return response
    } catch (error) {
      return 'fail'
    } finally {
      qb.release()
    }
  },
  async forceDelete(id) {
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

module.exports = Category
