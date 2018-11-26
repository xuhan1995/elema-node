'use strict'

import AddressComponent from '../../prototype/addressComponent'
import categoryModel from '../../models/shopping/category'

class Category extends AddressComponent {
  constructor () {
    super()
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
}

export default new Category()