'use strict'

import AddressComponent from '../../prototype/addressComponent'
import remarkModel from '../../models/v1/remark'

class Remark extends AddressComponent {
  constructor(){
    super()
  }

  async getRemarks (req, res) {
    const cart_id = req.params.cart_id
    try {
      if (!cart_id || isNaN(cart_id)) {
				throw new Error('获取购物车ID错误')        
      }
    } catch (error) {
      console.error(error)
      res.status(400).send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '购物车ID参数错误',
			})
			return
    }

    try {
      const remarks = await remarkModel.findOne({}, '-_id')
      res.send(remarks)
    } catch (error) {
      console.error('获取备注数据失败',error);
			res.status(500).send({
				status: 0,
				type: 'ERROR_GET_DATA',
				message: '获取备注数据失败'
			})
    }
  }
}

export default new Remark