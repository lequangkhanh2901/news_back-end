const { check, validationResult } = require('express-validator')

const userValidator = {
  signUp: [
    check('name').trim().notEmpty().bail().isLength({ min: 3, max: 30 }).bail(),
    check('email').trim().isEmail().isLength({ max: 50 }).notEmpty().bail(),
    check('password').trim().notEmpty().bail().isLength({ min: 6, max: 20 }).bail(),
    (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.json({ code: 400, message: 'invalid data' })

      next()
    },
  ],
  login: [
    check('email').trim().notEmpty().bail().isEmail().isLength({ max: 50 }).bail(),
    check('password').trim().notEmpty().bail().isLength({ min: 6, max: 20 }).bail(),
    (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.json({
          code: 400,
          message: 'invalid data',
        })
      }
      next()
    },
  ],
  update: [
    check('name').trim().isLength({ min: 3, max: 30 }).bail(),
    (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.json({ code: 400, message: 'invalid data' })

      next()
    },
  ],
}

module.exports = { userValidator }
