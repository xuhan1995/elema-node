'use strict'

import {Food as FoodModel, Menu as MenuModel} from '../../models/shopping/food'
import BaseComponent from '../../prototype/baseComponent'
import formidable from 'formidable'
import shopModel from '../../models/shopping/shop'

class Food extends BaseComponent {
  constructor () {
    super ()
    this.defaultData = [{
			name: '热销榜',
			description: '大家喜欢吃，才叫真好吃。', 
			icon_url: "5da3872d782f707b4c82ce4607c73d1ajpeg",
			is_selected: true,
			type: 1,
			foods: [],
		}, {
			name: '优惠',
			description: '美味又实惠, 大家快来抢!', 
			icon_url: "4735c4342691749b8e1a531149a46117jpeg",
			type: 1,
			foods: [],
		}]
		this.addCategory = this.addCategory.bind(this)
		this.addFood = this.addFood.bind(this)
  }

	async getMenu (req, res) {
		const restaurant_id = req.query.restaurant_id
		try {
			if (!restaurant_id || isNaN(restaurant_id)) {
				throw new Error('获取餐馆参数ID错误')
			}
		} catch (error) {
			console.error(error)
			res.status(400).send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '餐馆ID参数错误',
			})
			return
		}
		const filter = {
			restaurant_id,
			$where: 'this.foods.length > 0'
		}
		try {
			const menu = await MenuModel.find(filter, '-_id')
			res.send(menu)
		} catch (error) {
			console.error('获取食品数据失败', error);
			res.status(500).send({
				status: 0,
				type: 'GET_DATA_ERROR',
				message: '获取食品数据失败'
			})
		}
	}

	async addFood (req, res) {
		const form = new formidable.IncomingForm()
		form.parse(req, async (err, fields, file) => {
			fields.specs = JSON.parse(fields.specs)
			fields.attributes = JSON.parse(fields.attributes)
			try {
				if (!fields.name) {
					throw new Error('必须填写食品名称')
				} else if (!fields.image_path) {
					throw new Error('必须上传食品图片')
				} else if (!fields.specs.length) {
					throw new Error('至少填写一种规格')
				} else if (!fields.category_id) {
					throw new Error('食品类型ID错误')
				} else if (!fields.restaurant_id) {
					throw new Error('餐馆ID错误')
				}
			} catch (error) {
				console.error('前台参数错误', err.message);
				res.status(400).send({
					status: 0,
					type: 'ERROR_PARAMS',
					message: error.message
				})
				return
			}

			let category;
			try {
				category = await MenuModel.findOne({ id : fields.category_id })
			} catch (error) {
				console.error('获取食品类型和餐馆信息失败');
				res.status(500).send({
					status: 0,
					type: 'ERROR_DATA',
					message: '获取食品类型和餐馆信息失败'
				})
				return
			}

			let item_id
			try{
				item_id = await this.getId('item_id');
			}catch(error){
				console.error('获取item_id失败');
				res.send({
					status: 0,
					type: 'ERROR_DATA',
					message: '添加食品失败'
				})
				return
			}
			// mock评论数和销量
			const rating_count = Math.ceil( Math.random() * 1000 )
			const month_sales = Math.ceil( Math.random() * 1000 )
			const tips = rating_count + "评价 月售" + month_sales + "份"
			const newFood = {
				name: fields.name,
				description: fields.description,
				image_path: fields.image_path,
				activity: null,
				attributes: [],
				restaurant_id: fields.restaurant_id,
				category_id: fields.category_id,
				satisfy_rate: Math.ceil(Math.random()*100),
				satisfy_count: Math.ceil(Math.random()*1000),
				item_id,
				rating: (4 + Math.random()).toFixed(1),
				rating_count,
				month_sales,
				tips,
				specfoods: [],
				specifications: [],
			}
			if (fields.activity) {
				newFood.activity = {
					image_text_color: 'f1884f',
					icon_color: 'f07373',
					image_text: fields.activity,
				}
			}
			if (fields.attributes.length) {
				fields.attributes.forEach(item => {
					let attr;
					switch(item){
						case '新': 
							attr = {
								icon_color: '5ec452',
								icon_name: '新'
							}
							break;
						case '招牌': 
							attr = {
								icon_color: 'f07373',
								icon_name: '招牌'
							}
							break;
					}
					newFood.attributes.push(attr)
				})
			}
			try {
				const [specfoods, specifications] = await this.getSpecfoods(fields, item_id)
				newFood.specfoods = specfoods;
				newFood.specifications = specifications;
			} catch (error) {
				console.log('添加specs失败');
				res.status(500).send({
					status: 0,
					type: 'ERROR_DATA',
					message: '添加食品失败'
				})
				return
			}

			try {
				const foodEntity = await FoodModel.create(newFood) //保存新文档
				category.foods.push(foodEntity)
				await category.save() //更新文档
				res.send({
					status: 1,
					success: '添加食品成功',
				})
			} catch (error) {
				console.error('保存食品到数据库失败', error)
				res.status(500).send({
					status: 0,
					type: 'ERROR_DATA',
					message: '添加食品失败'
				})
			}
		})
	}

	async getSpecfoods(fields, item_id){
		let specfoods = [], specifications = [];
		if (fields.specs.length < 2) {
			let food_id, sku_id;
			try{
				sku_id = await this.getId('sku_id');
				food_id = await this.getId('food_id');
			}catch(err){
				throw new Error('获取sku_id、food_id失败')
			}
			specfoods.push({
				packing_fee: fields.specs[0].packing_fee,
				price: fields.specs[0].price,
				specs: [],
				specs_name: fields.specs[0].specs,
				name: fields.name,
				item_id,
				sku_id,
				food_id,
				restaurant_id: fields.restaurant_id,
				recent_rating: (Math.random()*5).toFixed(1),
				recent_popularity: Math.ceil(Math.random()*1000),
			})
		}else{
			specifications.push({
				values: [],
				name: "规格"
			})
			for (let i = 0; i < fields.specs.length; i++) {
				let food_id, sku_id;
				try{
					sku_id = await this.getId('sku_id');
					food_id = await this.getId('food_id');
				}catch(err){
					throw new Error('获取sku_id、food_id失败')
				}
				specfoods.push({
					packing_fee: fields.specs[i].packing_fee,
					price: fields.specs[i].price,
					specs: [{
						name: "规格",
						value: fields.specs[i].specs
					}],
					specs_name: fields.specs[i].specs,
					name: fields.name,
					item_id,
					sku_id,
					food_id,
					restaurant_id: fields.restaurant_id,
					recent_rating: (Math.random()*5).toFixed(1),
					recent_popularity: Math.ceil(Math.random()*1000),
				})
				specifications[0].values.push(fields.specs[i].specs);
			}
		}
		return [specfoods, specifications]
	}

	async addCategory (req, res) {
		const form = new formidable.IncomingForm()
		form.parse(req, async (err, fields, file) => {
			try {
				if (!fields.name) {
					throw new Error('必须填写食品类型名称')
				} else if (!fields.restaurant_id) {
					throw new Error('必须填写餐馆ID')					
				}
			} catch (error) {
				res.status(400).send({
					status: 0,
					type: 'ERROR_PARAMS',
					message: error.message
				})
				return
			}

			let category_id
			try {
				category_id = await this.getId('category_id')
			} catch (error) {
				console.error('获取category_id失败')
				res.status(500).send({
					type: 'ERROR_DATA',
					message: '获取数据失败'
				})
				return
			}

			try {
				const restaurant = await MenuModel.find({ restaurant_id : fields.restaurant_id})
				const hasExisted = restaurant.some(ele => ele.name === fields.name)
				if (hasExisted) {
					throw new Error('该食品种类已存在')
				}
			} catch (error) {
				res.send({
					type: 'ERROR_DATA',
					message: '该食品种类已存在'
				})
				return
			}

			const food = {
				name: fields.name,
				description: fields.description, 
				restaurant_id: fields.restaurant_id, 
				id: category_id,
				foods: [],
			}
			const newFood = new MenuModel(food)
			try {
				await newFood.save()
				res.send({
					status: 1,
					success: '添加食品种类成功',
				})
			} catch (error) {
				console.log('添加食品种类失败');
				res.send({
					status: 0,
					type: 'ERROR_ADD_FOOD_CATEGORY',
					message: '添加食品种类失败'
				})
			}
		})
	}

  async initData (restaurant_id) {
    for (let i = 0; i < this.defaultData.length; i++) {
			let category_id
			try{
				category_id = await this.getId('category_id')
			}catch(err){
				console.log('获取category_id失败')
				return
			}
			const defaultData = this.defaultData[i]
			const category = {...defaultData, id: category_id, restaurant_id}
			const newFood = new MenuModel(category)
			try{
				await newFood.save()
				console.log('初始化食品数据成功')
			}catch(err){
				console.log('初始化食品数据失败');
			}
		}
  }

}

export default new Food()