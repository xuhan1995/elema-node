'use strict'

import ratingModel from '../../models/ugc/rating'

class Rating {
  constructor () {
    this.type = ['ratings', 'scores', 'tags']
    this.getRatings = this.getRatings.bind(this)
  }

  async getRatings (req, res) {
    const restaurant_id = req.params.restaurant_id
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

    try {
      const ratings = await ratingModel.getData(restaurant_id, this.type[0])
      if (typeof ratings === 'string') {
        throw new Error(ratings)
      } else {
        res.send(ratings)
      }
    } catch (error) {
      console.error('获取评论列表失败', error);
			res.status(500).send({
				status: 0,
				type: "ERROR_DATA",
				message: '未找到当前餐馆的评论数据'
			})
    }
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