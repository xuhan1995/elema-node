'use strict'

import BaseComponent from '../../prototype/baseComponent'
import addressModel from '../../models/v1/address'

class Address extends BaseComponent {
  constructor(){
    super()
  }

  async getAddress (req, res) {
    const user_id = req.params.user_id
    try {
      if (!user_id || isNaN(user_id)) {
				throw new Error('获取用户ID错误')
      }
    } catch (error) {
      console.error(error)
      res.status(400).send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '用户ID参数错误',
			})
			return
    }

    try {
      const userAddress =  await addressModel.findOne({ user_id })
      res.send(userAddress)
    } catch (error) {
      console.error('获取用户地址数据失败',error);
			res.status(500).send({
				status: 0,
				type: 'ERROR_GET_DATA',
				message: '获取用户地址数据失败'
			})
    }

  }

}

export default new Address