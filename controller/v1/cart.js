'use strict'

import AddressComponent from '../../prototype/addressComponent'
import formidable from 'formidable'
import paymentsModel from '../../models/v1/payments';
import shopModel from '../../models/shopping/shop';
import cartModel from '../../models/v1/cart';

class Cart extends AddressComponent {
  constructor(){
    super()
    this.checkout = this.checkout.bind(this)
    this.extra = [{
			description: '',
			name: '餐盒',
			price: 0,
			quantity: 1,
			type: 0,
		}]
  }

  async checkout (req, res) {
    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fields, files) => {
      fields.entities = JSON.parse(fields.entities)
      const { geohash, entities, restaurant_id } = fields
      try {
        if(!(entities instanceof Array) || !entities.length || !(entities[0] instanceof Array) || !entities[0].length){
					throw new Error('entities参数错误')
				}else if(!geohash){
					throw new Error('geohash参数错误')
				}else if(!restaurant_id){
					throw new Error('restaurant_id参数错误')
				}
      } catch (error) {
        console.log(error);
				res.status(400).send({
					status: 0,
					type: 'ERROR_PARAMS',
					message: err.message
				})
				return
      }

      let payments; //付款方式
			let cart_id; //购物车id
			let restaurant; //餐馆详情
			let deliver_time; //配送时间
			let delivery_reach_time; //到达时间
      let from = geohash
      try {
        payments = await paymentsModel.find()
        cart_id = await this.getId('cart_id')
        restaurant = await shopModel.findOne({ id: restaurant_id })
        const to = restaurant.latitude+ ',' + restaurant.longitude
        deliver_time = await this.getDistance(from, to, 'tiemvalue');
        let time = new Date().getTime() + deliver_time * 1000
        let hour = ('0' + new Date(time).getHours()).substr(-2)
        let minute = ('0' + new Date(time).getMinutes()).substr(-2)
        delivery_reach_time = hour + ':' + minute
      } catch (error) {
        console.error('获取数据数据失败', error);
				res.status(500).send({
					status: 0,
					type: 'ERROR_DATA',
					message: '添加购物车失败',
				})
				return
      }

      const deliver_amount = 4
      let price = 0 //食品价格
      entities[0].map(item => {
        price += item.price * item.quantity;
        if (item.packing_fee) {
          this.extra[0].price += item.packing_fee * item.quantity;
        }
        if (item.specs[0]) {
          return item.name = item.name + '-' + item.specs[0];
        }
      })
      const total = price + this.extra[0].price * this.extra[0].quantity + deliver_amount
      let invoice = {
        is_available: false,
        status_text: "商家不支持开发票",
      }
      restaurant.supports.forEach(item => {
				if (item.icon_name == '票') {
					invoice = {
						is_available: true,
						status_text: "不需要开发票",
					}
				}
      })
      const checkoutInfo = {
				id: cart_id,
				cart: {
					id: cart_id,
					groups: entities,
					extra: this.extra,
					deliver_amount,
					is_deliver_by_fengniao: !!restaurant.delivery_mode,
					original_total: total,
					phone: restaurant.phone,
					restaurant_id,
					restaurant_info: restaurant,
					restaurant_minimum_order_amount: restaurant.float_minimum_order_amount,
					total,
					user_id: req.session.user_id,
				},
				delivery_reach_time,
				invoice,
				sig: Math.ceil(Math.random()*1000000).toString(),
				payments,
      }

      try {
        const newCart = await cartModel(checkoutInfo)
        res.send(newCart)
      } catch (error) {
        console.log('保存购物车数据失败');
				res.status(500).send({
					status: 0,
					type: 'ERROR_TO_SAVE_CART',
					message: '加入购物车失败'
				})
      }
    })

  }

}

export default new Cart()