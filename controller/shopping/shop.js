'use strict'

import AddressComponent from '../../prototype/addressComponent'
import CategoryHandler from './category'
import shopModel from '../../models/shopping/shop'

class Shop extends AddressComponent {
  constructor(){
    super()
  }

  async getRestaurants (req, res) {
    const {
			latitude,
			longitude,
			offset = 0,
			limit = 20,
			keyword,
			restaurant_category_id,
			order_by,
			extras,
			delivery_mode = [],
			support_ids = [],
			restaurant_category_ids = [],
    } = req.query

    try {
      if (!latitude) {
        throw new Error('latitude参数错误')
      }
      if (!longitude) {
        throw new Error('longitude参数错误')
      }
    } catch (error) {
      console.error(error)
      res.status(406).json({
				name: 'ERROR_PARAMS',
				message: 'error.message',
			})
    }

    //获取餐馆分类
    const filter = {}
    if (restaurant_category_ids.length && Number(restaurant_category_ids[0])) {
      try {
        const category = await CategoryHandler.findById(restaurant_category_ids[0])
        Object.assign(filter, {category})
      } catch (error) {
        console.error(error)
        res.status(500).send({
          type: 'ERROR_GET_SHOP_CATEGORY',
          message: '获取店铺类型失败'
        })
      }
    }

		//配置筛选和排序
    const sortBy = {}
    if (Number(order_by)) {//配送速度和距离是筛选，其他是排序
			switch(Number(order_by)){
				case 1:
					Object.assign(sortBy, {float_minimum_order_amount: 1});
					break;
				case 2:
					Object.assign(filter, {location: {$near: [longitude, latitude]}});
					break;
				case 3:
					Object.assign(sortBy, {rating: -1});
					break;
				case 5:
					Object.assign(filter, {location: {$near: [longitude, latitude]}});
					break;
				case 6:
					Object.assign(sortBy, {recent_order_num: -1});
					break;
			}
    }
    
    //配置配送方式的排序策略
    if (delivery_mode.length) {
      delivery_mode.forEach(ele => {
        if (Number(ele)) {
          Object.assign(sortBy, {'delivery_mode.id': Number(item)})
        }
      })
    }

    //餐馆支持特权的id
    if (support_ids.length) {
      const filterArr = []
      support_ids.forEach(ele => {
        const id = Number(ele)
        if (id && id != 8) {
          filterArr.push(id)
        } else if (id == 8) {
          Object.assign(filter, {is_premium: true})
        }
      })
      if (filterArr.length) {//匹配同时拥有多种特权的数据
        Object.assign(filter, {'supports.id': {$all: filterArr}})
      }
    }

    const restaurants = await shopModel.find(filter, '-_id').sort(sortBy).limit(Number(limit)).skip(Number(offset))
    const from = latitude + ',' + longitude
    let to = ''
    // 百度地图测距需要饭店的经纬度
    restaurants.forEach((ele, index) => {
      const splitStr = index === restaurants.length - 1 ? '' : '|'
      to += ele.latitude + ',' + ele.longitude + splitStr
    })
    try {
      if (restaurants.length) {
        const distance_duration = await this.getDistance(from, to)
        restaurants.forEach((ele, index) => {
          Object.assign(ele, distance_duration[index])
        })
      }
    } catch (error) {
      // 百度地图达到上限后会导致加车失败，需优化
      console.error('从addressComoponent获取测距数据失败', err);
      restaurants.forEach(ele => {
				return Object.assign(ele, {distance: '10公里', order_lead_time: '40分钟'})
			})
    }
    try{
			res.send(restaurants)
		}catch(err){
			res.status(500).send({
				type: 'ERROR_GET_SHOP_LIST',
				message: '获取店铺列表数据失败'
			})
		}
    
  }
}

export default new Shop()