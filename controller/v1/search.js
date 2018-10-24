import AddressComponent from '../../prototype/addressComponent'
import CitiesHandler from '../v1/cities'
import Cities from '../../models/v1/cities'

class SearchPlace extends AddressComponent {
  constructor(){
    super()
    this.search = this.search.bind(this)
    this.getDetailLocation = this.getDetailLocation.bind(this)
  }

  async search(req, res){
    const {city_id, keyword, type = search} = req.query
    if (!keyword) {
      res.status(406).send({
				name: 'MISSING_KEYWORD',
				message: '参数错误',
			})
			return
    }
    else if (isNaN(city_id) || !city_id) {
      try {
        const cityName = await CitiesHandler.getCityName(req)
        const {id} = await Cities.citiesGuess(cityName)
        city_id = id
      } catch (error) {
        console.log('获取定位城市失败')
				res.status(406).send({
					name: 'ERROR_GET_POSITION',
					message: '获取数据失败',
				})
      }
    }
    try {
      const {name} = await Cities.getCitiesById(city_id)
      const {data} = await this.searchPlace(keyword, name, type)
      res.send(data)
    } catch (error) {
      res.status(500).send({
				name: 'GET_ADDRESS_ERROR',
				message: '获取地址信息失败',
      });
      throw error
    }
  }

  async getDetailLocation(req, res){
    const geohash = req.params.geohash
    if (geohash.search(',') == -1) {
      res.status(406).send({
        name: 'ERROR_GEOHASH',
				message: '获取到的经纬度错误',
      })
    }
    try {
      const {result} = await this.getLocationByGeohash(geohash)
      res.send(result)
    } catch (error) {
      res.status(500).send({
        name: 'GET_DETAIL_LOCATION_ERROR',
				message: '获取详细地址信息失败',
      })
      throw error
    }
  }
}

export default new SearchPlace