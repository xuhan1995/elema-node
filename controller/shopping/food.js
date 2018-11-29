'use strict'

import {Food as FoodModel, Menu as MenuModel} from '../../models/shopping/food'
import BaseComponent from '../../prototype/baseComponent'
import formidable from 'formidable'

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
  }

	async addCategory (req, res) {
		const form = new formidable.IncomingForm()
		form.parse(req, async (err, fields, file) => {
			try {
				if (!fields.name) {
					throw new Error('必须填写食品类型名称')
				}
				if (!fields.restaurant_id) {
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
				const restaurant = await MenuModel.find({ restaurant_id })
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