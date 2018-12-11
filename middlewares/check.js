'use strict'

import adminModel from '../models/admin/admin'

class Check {
  constructor () {

  }

  async checkAdmin (req, res, next) {
    const admin_id = req.session.admin_id
    if (!admin_id || Number(admin_id)) {
      res.send({
				status: 0,
				type: 'ERROR_SESSION',
				message: '亲，您还没有登录',
      })
      return
    } else {
      try {
        const admin = await adminModel.findOne({ id : admin_id })
        if (!admin) {
          res.send({
            status: 0,
            type: 'HAS_NO_ACCESS',
            message: '亲，您还不是管理员',
          })
          return
        }
      } catch (error) {
        res.status(500).send({
          status: 0,
          type: 'ERROR_SEARCH_ADMIN',
          message: '查找管理员失败',
        })
        return
      }
    }
    next()
  }

}

export default new Check()