'use strict';

import Cities from '../../models/v1/cities'
import pinyin from "pinyin"

class CitiesHandler {
	constructor() {
		this.getCities = this.getCities
	}

	async getCities(req, res) {
		const type = req.query.type
		let citiesInfo
		try {
			switch (type) {
				case 'guess':
					console.log('coming soon...')
					break
				case 'hot':
					console.log('coming soon...')
					break
				case 'group':
					citiesInfo = await Cities.citiesGroup()
					break
				default:
					res.json({
						name: 'ERROR_QUERY_TYPE',
						message: '参数错误',
					})
					return
			}
			res.send(citiesInfo)
		} catch (error) {
			res.send({
				name: 'ERROR_DATA',
				message: '获取数据失败',
			})
			console.error(error)
		}
	}
}

export default new CitiesHandler