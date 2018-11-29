'use strict'

import ratingModel from '../../models/ugc/rating'

class Rating {
  constructor () {

  }

  async initData (restaurant_id) {
    try {
      const status = await ratingModel.initData(restaurant_id)
      if (status) {
        console.log('初始化评论数据成功') 
      }
    } catch (error) {
        console.error('初始化评论数据失败')
    }
  }
}

export default new Rating()