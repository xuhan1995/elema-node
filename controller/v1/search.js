import AddressComponent from '../../prototype/addressComponent'
import CitiesHandler from '../v1/cities'
import Cities from '../../models/v1/cities'

class SearchPlace extends AddressComponent {
  constructor(){
    super()
    this.search = this.search.bind(this)
  }

  async search(req, res){
    const {city_id, keyword, type = search} = req.query
    console.log(keyword)
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
    }
  }
}

export default new SearchPlace