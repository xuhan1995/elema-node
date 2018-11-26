'use strict'

import foodCategories from '../../models/v2/foodCategories'

class entry {
  constructor(){

  }
  async getFoodCategories(req, res) {
    try {
      const result = await foodCategories.find({})
      res.send(result)
    } catch (error) {
      res.status(500).send({
        type: 'ERROR_DATA',
        message: '获取数据失败'
      })
      throw error
    }
  }
}

export default new entry()