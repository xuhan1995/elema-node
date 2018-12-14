'use strict'

import BaseComponent from '../../prototype/baseComponent'
import formidable from 'formidable'
import cartModel from '../../models/v1/cart'
import orderModel from '../../models/bos/order'
import timeFormater from 'time-formater'

class Order extends BaseComponent {
  constructor(){
    super()
    this.postOrder = this.postOrder.bind(this)
  }

  async postOrder (req, res) {
    const { user_id, cart_id } = req.params
    try {
      if (!user_id || isNaN(user_id) || !cart_id || isNaN(cart_id)) {
        throw new Error('参数错误')
      }
    } catch (error) {
      console.error(error)
      res.status(400).send({
        status: 0,
        type: 'ERROR_PARAMS',
        message: err.message
      })
      return
    }
    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fields, files) => {
      fields.entities = JSON.parse(fields.entities)
      const { address_id, entities } = fields
      try{
				if(!(entities instanceof Array) || !entities.length){
					throw new Error('entities参数错误')
				}else if(!(entities[0] instanceof Array) || !entities[0].length){
					throw new Error('entities参数错误')
				}else if(!address_id){
					throw new Error('address_id参数错误')
				}
			}catch(err){
				console.error(err);
				res.status(400).send({
					status: 0,
					type: 'ERROR_PARAMS',
					message: err.message
				})
				return 
      }

      let cartDetail
      let order_id
      try {
        cartDetail = await cartModel.findOne({ id: cart_id })
        order_id = await this.getId('cart_id')
      } catch (error) {
        console.log('获取数据失败', error);
				res.status(500).send({
					status: 0,
					type: 'ERROR_GET_DATA',
					message: '获取订单失败',
				})
				return 
      }
      const deliver_fee = {price: cartDetail.cart.deliver_amount};
			const orderObj = {
				basket: {
					group: entities,
					packing_fee: {
						name: cartDetail.cart.extra[0].name,
						price: cartDetail.cart.extra[0].price,
						quantity: cartDetail.cart.extra[0].quantity,
					},
					deliver_fee,
				},
				restaurant_id: cartDetail.cart.restaurant_id,
				restaurant_image_url: cartDetail.cart.restaurant_info.image_path,
				restaurant_name:  cartDetail.cart.restaurant_info.name,
				formatted_created_at: timeFormater().format('YYYY-MM-DD HH:mm'),
				order_time: new Date().getTime(),
				time_pass: 900,
				status_bar: {
					color: 'f60',
					image_type: '',
					sub_title: '15分钟内支付',
					title: '',
				},
				total_amount: cartDetail.cart.total,
				total_quantity: entities[0].length,
				unique_id: order_id,
				id: order_id,
				user_id,
				address_id,
      }
      try {
        await orderModel.create(orderObj)
        res.send({
          status: 1,
					success: '下单成功，请及时付款',
					need_validation: false,
        })
      } catch (error) {
        console.error('保存订单数据失败');
				res.status(500).send({
					status: 0,
					type: 'ERROR_SAVE_ORDER',
					message: '保存订单失败'
				})
      }
    })
  }
}

export default new Order()