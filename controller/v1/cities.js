'use strict';

import Cities from '../../models/v1/cities'
import pinyin from "pinyin"
import AddressComponent from "../../prototype/addressComponent"

class CitiesHandler extends AddressComponent {
	constructor() {
		super()
		this.getCities = this.getCities.bind(this)
	}

	async getCities(req, res) {
		const type = req.query.type
		let citiesInfo
		try {
			switch (type) {
				case 'guess':
					const cityName = await this.getCityName(req)
					citiesInfo = await Cities.citiesGuess(cityName)
					break
				case 'hot':
					citiesInfo = await Cities.citiesHot()
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

	async getCityName(req){
		let cityInfo
		try {
			cityInfo = await this.getPosition(req)
		} catch (error) {
			console.error('获取IP位置信息失败', error);
			throw error
		}
		const pinyinArr = pinyin(cityInfo.city, {
			style: pinyin.STYLE_NORMAL,
		})
		let cityName = ''
		pinyinArr.forEach(ele => cityName += ele[0])
		return cityName
	}
}

export default new CitiesHandler