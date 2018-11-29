'use strict'

import AddressComponent from '../../prototype/addressComponent'
import categoryModel from '../../models/shopping/category'
import deliveryModel from '../../models/shopping/delivery'
import activityModel from '../../models/shopping/activity'

class Category extends AddressComponent {
  constructor () {
    super()
  }

  async addCategory (category) {
    const categoryNames = category.split('/')
    try {
      const allCategory = await categoryModel.findOne()  //第一个对象，总计
      const subCategory = await categoryModel.findOne({ name : categoryNames[0] })
      allCategory.count ++
      subCategory.count ++
      subCategory.sub_categories.forEach(item => {
        if (item.name == categoryNames[1]) {
          item.count ++
        }
      })
      await allCategory.save()
      await subCategory.save()
      console.log('更新cetegroy成功');
    } catch (error) {
      console.error('更新cetegroy失败')
    }
  }
  
  async findById (id) {
    try {
      const { name , sub_categories} = await categoryModel.findOne({'sub_categories.id': id}) // 数组sub_categories中各项目按id查找
      let categoryName = name
      sub_categories.forEach(ele => {
        if (ele.id == id) {
          categoryName += '/' + ele.name
        }
      })
      return categoryName
    } catch (error) {
      console.log('通过category id获取数据失败')
			throw new Error(error)
    }
  }
  //获取所有餐馆
  async getCategories (req, res) {
    try {
      const categories = await categoryModel.find({}, '-_id')
      res.send(categories)
    } catch (error) {
      console.error(error)
      res.status(500).send({
				status: 0,
				type: 'ERROR_CATEGORY',
				message: '获取categories失败'
			})
    }
  }
  
  async getDeliveries (req, res) {
    try {
      const deliveries = await deliveryModel.find({}, '-_id')
      res.send(deliveries)
    } catch (error) {
      res.status(500).send({
				status: 0,
				type: 'ERROR_DELIVERY',
				message: '获取deliveries失败'
			})
    }
  }

  async getActivities (req, res) {
    try {
      const activities = await activityModel.find({}, '-_id')
      res.send(activities)
    } catch (error) {
      res.status(500).send({
				status: 0,
				type: 'ERROR_ACTIVITY',
				message: '获取activies失败'
			})
    }
  }
}

export default new Category()