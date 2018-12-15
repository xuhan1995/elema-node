'use strict'

import AddressComponent from '../../prototype/addressComponent'
import CategoryHandler from './category'
import shopModel from '../../models/shopping/shop'
import formidable from 'formidable'
import rating from '../ugc/rating'
import food from './food'

class Shop extends AddressComponent {
  constructor(){
    super()
    this.getRestaurants = this.getRestaurants.bind(this)
    this.addShop = this.addShop.bind(this)
    this.searchResaturant = this.searchResaturant.bind(this)
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
      } else if (!longitude) {
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
        restaurants = await this.getDistanceInfo(restaurants, latitude, longitude)
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
      } else if (!keyword.trim()) {
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
        const [latitude, longitude] = geohash.split(',')
        restaurants = await this.getDistanceInfo(restaurants, latitude, longitude)
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
  //获取配送时间
  async getDistanceInfo(restaurants, latitude, longitude) {
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
      console.error('从addressComoponent获取测距数据失败', error);
      restaurants.forEach(ele => {
        return Object.assign(ele, {distance: '10公里', order_lead_time: '40分钟'})
      })
    }
  }
  //添加店铺
  async addShop (req, res) {
    let restaurant_id
    try {
      restaurant_id = await this.getId('restaurant_id')
    } catch (error) {
      console.error('获取商店id失败');
			res.status(500).send({
				type: 'ERROR_DATA',
				message: '获取数据失败'
			})
			return
    }
      const shopInfo = new formidable.IncomingForm()
      shopInfo.parse(req, async (err, fields, file) => {
        try {
          if (!fields.name) {
            throw new Error('必须填写商店名称');
          } else if(!fields.address){
            throw new Error('必须填写商店地址');
          } else if(!fields.phone){
            throw new Error('必须填写联系电话');
          } else if(!fields.latitude || !fields.longitude){
            throw new Error('商店位置信息错误');
          } else if(!fields.image_path){
            throw new Error('必须上传商铺图片');
          } else if(!fields.category){
            throw new Error('必须上传食品种类');
          } else if (!fields.float_delivery_fee) {
            throw new Error('必须上传运费');
          } else if (!fields.float_minimum_order_amount) {
            throw new Error('必须上传起送价');
          }
        } catch (error) {
          console.error('前端参数不全', error.message);
          res.status(400).send({
            status: 0,
            type: 'ERROR_PARAMS',
            message: error.message
          })
          return
        }
        const hasExisted = await shopModel.findOne({ name: fields.name})
        if (hasExisted) {
          res.send({
            status: 0,
            type: 'RESTURANT_EXISTS',
            message: '店铺已存在，请尝试其他店铺名称',
          })
          return
        }
        const opening_hours = fields.startTime && fields.endTime ? fields.startTime + '/' +fields.endTime : "7:00/21:30"
        const newShop = {
          name: fields.name,
          address: fields.address,
          description: fields.description || '',
          float_delivery_fee: fields.float_delivery_fee,
          float_minimum_order_amount: fields.float_minimum_order_amount,
          id: restaurant_id,
          is_premium: fields.is_premium || false,
          is_new: fields.new || false,
          latitude: fields.latitude,
          longitude: fields.longitude,
          location: [fields.longitude, fields.latitude],
          opening_hours: [opening_hours],
          phone: fields.phone,
          promotion_info: fields.promotion_info || "欢迎光临，用餐高峰请提前下单，谢谢",
          rating: (4 + Math.random()).toFixed(1),
          rating_count: Math.ceil(Math.random()*1000),
          recent_order_num: Math.ceil(Math.random()*1000),
          status: Math.round(Math.random()),
          image_path: fields.image_path,
          category: fields.category,
          piecewise_agent_fee: {
            tips: "配送费约¥" + (fields.float_delivery_fee),
          },
          activities: [],
          supports: [],
          license: {
            business_license_image: fields.business_license_image || '',
            catering_service_license_image: fields.catering_service_license_image || '',
          },
          identification: {
            company_name: "",
            identificate_agency: "",
            identificate_date: "",
            legal_person: "",
            licenses_date: "",
            licenses_number: "",
            licenses_scope: "",
            operation_period: "",
            registered_address: "",
            registered_number: "",
          },
        }
        //配送方式为true时添加
        if (fields.delivery_mode) {
          Object.assign(newShop, {
            delivery_mode: {
              color: "57A9FF",
              id: 1,
              is_solid: true,
              text: "蜂鸟专送"
            }
          })
        }
        //商店支持的活动
        const activities = JSON.parse(fields.activities)
        if (activities.length) {
          activities.forEach((item, index) => {
            switch(item.icon_name){
              case '减': 
                item.icon_color = 'f07373';
                item.id = index + 1;
                break;
              case '特': 
                item.icon_color = 'EDC123';
                item.id = index + 1;
                break;
              case '新': 
                item.icon_color = '70bc46';
                item.id = index + 1;
                break;
              case '领': 
                item.icon_color = 'E3EE0D';
                item.id = index + 1;
                break;
            }
            newShop.activities.push(item)
          })
        }
        //红包
        if (fields.bao) {
          newShop.supports.push({
            description: "已加入“外卖保”计划，食品安全有保障",
            icon_color: "999999",
            icon_name: "保",
            id: 7,
            name: "外卖保"
          })
        }
        //准时达
        if (fields.zhun) {
          newShop.supports.push({
            description: "准时必达，超时秒赔",
            icon_color: "57A9FF",
            icon_name: "准",
            id: 9,
            name: "准时达"
          })
        }
        //开发票
        if (fields.piao) {
          newShop.supports.push({
            description: "该商家支持开发票，请在下单时填写好发票抬头",
            icon_color: "999999",
            icon_name: "票",
            id: 4,
            name: "开发票"
          })
        }

        try {
          //保存数据，并增加对应食品种类的数量
          const shop = new shopModel(newShop)
          await shop.save()
          //添加种类
          CategoryHandler.addCategory(fields.category)
          //初始化评论
          rating.initData(restaurant_id)
          //初始化菜单
          food.initData(restaurant_id)
          res.send({
            status: 1,
            sussess: '添加餐馆成功',
            shopDetail: newShop
          })
        } catch (error) {
          console.error('商铺写入数据库失败')
          res.send({
            status: 0,
            type: 'ERROR_SERVER',
            message: '添加商铺失败',
          })
        }

      })
  }

  async updateShop (req, res) {
    const form = new formidable.IncomingForm()
    form.parse(req, async (err, fields, files) => {
      if (err) {
				console.error('获取商铺信息form出错', err);
				res.status(400).send({
					status: 0,
					type: 'ERROR_FORM',
					message: '表单信息错误',
				})
				return 
      }
      const {name, address, description = "", phone, category, id, latitude, longitude, image_path} = fields
      try {
        if (!name) {
					throw new Error('餐馆名称错误')
				}else if(!address){
					throw new Error('餐馆地址错误')
				}else if(!phone){
					throw new Error('餐馆联系电话错误')
				}else if(!category){
					throw new Error('餐馆分类错误')
				}else if(!id || !Number(id)){
					throw new Error('餐馆ID错误')
				}else if(!image_path){
					throw new Error('餐馆图片地址错误')
        }
        let newData
				if (latitude && longitude) {
					newData = {name, address, description, phone, category, latitude, longitude, image_path}
				}else{
					newData = {name, address, description, phone, category, image_path}
        }
        await shopModel.findOneAndUpdate({ id }, { $set: newData })
        res.send({
					status: 1,
					success: '修改商铺信息成功',
				})
      } catch (error) {
        console.error(error);
				res.status(500).send({
					status: 0,
					type: 'ERROR_UPDATE_RESTAURANT',
					message: '更新商铺信息失败',
				})
      }
    })
  }

  async removeResturant (req, res) {
    const restaurant_id = req.params.restaurant_id
    try {
      if (!restaurant_id || isNaN(restaurant_id)) {
        throw new Error('餐馆ID参数错误')
      }
    } catch (error) {
      console.error(error)
      res.status(400).send({
        status: 0,
				type: 'ERROR_PARAMS',
				message: 'restaurant_id参数错误'
      })
      return
    }
    try {
      const restaurant = await shopModel.findOneAndRemove({ id: restaurant_id })
      if (restaurant) {
        res.send({
          status: 1,
          success: '删除餐馆成功'
        })
      } else {
        throw new Error('未找到餐馆，删除失败')
      }
    } catch (error) {
      console.error(error)
      res.status(500).send({
				type: 'ERROR_DELETE_RESTAURANT',
				message: '未找到餐馆，删除失败'
			})
    }
  }
  
  async getRestaurantsCount (req, res) {
    try {
      const restaurantsNum = await shopModel.count()
      res.send({
        status: 1,
				restaurantsNum
      })
    } catch (error) {
      console.error(error)
      res.status(500).send({
        status: 0,
				type: 'ERROR_TO_GET_COUNT', 
				message: '获取餐馆数量失败'
      })
    }
  }
}

export default new Shop()