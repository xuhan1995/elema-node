'use strict'

import AddressComponent from '../../prototype/addressComponent'
import CategoryHandler from './category'
import shopModel from '../../models/shopping/shop'

class Shop extends AddressComponent {
  constructor(){
    super()
    this.getRestaurants = this.getRestaurants.bind(this)
    this.getDistanceInfo = this.getDistanceInfo.bind(this)
  }
  // 筛选餐馆
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
        status: 0,
        name: 'ERROR_PARAMS',
				message: 'error.message',
      })
      return
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

    try {
      let restaurants = await shopModel.find(filter, '-_id').sort(sortBy).limit(Number(limit)).skip(Number(offset))    
      if (restaurants.length) {
        restaurants = this.getDistanceInfo(restaurants)
      }
      res.send(restaurants)
    } catch (error) {
      console.error(error)
      res.status(500).send({
				type: 'ERROR_GET_SHOP_LIST',
				message: '获取店铺列表数据失败'
			})
    }
  }
  //按关键字和经纬度搜索餐馆
  async searchResaturant (req, res) {
    const { geohash , keyword } = req.query
    try {
      if (!geohash || geohash.indexOf(',') === -1) {
        throw new Error('经纬度错误')
      }
      if (!keyword.trim()) {
        throw new Error('关键字错误')
      }
    } catch (error) {
      console.error(error)
      res.status(400).send({
        status: 0,
				type: 'ERROR_PARAMS',
				message: '参数错误',
      })
      return
    }

    try {
      let restaurants = await shopModel.find({name: eval('/' + keyword + '/gi')}, '-_id').limit(50)
      if (restaurants.length) {
        restaurants = this.getDistanceInfo(restaurants)
      }
      res.send(restaurants)
    } catch (error) {
      console.error(error)
      res.status(500).send({
        type: 'ERROR_SEARCH_SHOP',
        message: '搜索店铺失败'
			})
    }

  }
  //通过shopid获取餐馆详情
  async getRestaurantDetail (req, res) {
    const shopid = req.params.shopid
    try {
      if (!shopid || isNaN(shopid)) {
        throw new Error('错误的shopid')
      }
    } catch (error) {
      console.error(error)
      res.status(400).send({
        status: 0,
				type: 'ERROR_SHOPID',
				message: '错误的shopid',
      })
      return
    }

    try {
      const restaurantDetail = await shopModel.findOne({ id : shopid}, '-_id')
      res.send(restaurantDetail)
    } catch (error) {
      console.log(error)
      res.status(500).send({
        type: 'ERROR_SEARCH_RESTAURANT_DETAIL',
        message: '搜索店铺失败'
      })
    }
  }

  async getDistanceInfo (restaurants) {
    try {
        const from = latitude + ',' + longitude
        let to = ''
        // 百度地图测距需要饭店的经纬度
        restaurants.forEach((ele, index) => {
          const splitStr = index === restaurants.length - 1 ? '' : '|'
          to += ele.latitude + ',' + ele.longitude + splitStr
        })
        const distance_duration = await this.getDistance(from, to)
        restaurants.forEach((ele, index) => {
          Object.assign(ele, distance_duration[index])
        })
        return restaurants
    } catch (error) {
      // 百度地图达到上限后会导致加车失败，需优化
      console.error('从addressComoponent获取测距数据失败', err);
      restaurants.forEach(ele => {
        return Object.assign(ele, {distance: '10公里', order_lead_time: '40分钟'})
      })
    }
  }
}

export default new Shop()