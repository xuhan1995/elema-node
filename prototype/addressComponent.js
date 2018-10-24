'use strict'

import BaseComponent from './baseComponent'

export default class AddressComponent extends BaseComponent{
  constructor(){
    super()
    this.tencentkey = 'RLHBZ-WMPRP-Q3JDS-V2IQA-JNRFH-EJBHL';
		this.tencentkey2 = 'RRXBZ-WC6KF-ZQSJT-N2QU7-T5QIT-6KF5X';
		this.tencentkey3 = 'OHTBZ-7IFRG-JG2QF-IHFUK-XTTK6-VXFBN';
		this.baidukey = 'fjke3YUipM9N64GdOIh1DNeK2APO2WcT';
		this.baidukey2 = 'fjke3YUipM9N64GdOIh1DNeK2APO2WcT';
  }

  async getPosition(req){
    return new Promise(async(resolve, reject) => {
      let ip = req.headers['x-forwarded-for'] || 
	 		req.connection.remoteAddress || 
	 		req.socket.remoteAddress ||
	 		req.connection.socket.remoteAddress;
	 		const ipArr = ip.split(':');
	 		ip = ipArr[ipArr.length -1];
	 		if (process.env.NODE_ENV == 'development') {
	 			ip = '180.158.102.141';
      }
      try{
        let result = await this.fetch('http://apis.map.qq.com/ws/location/v1/ip', {
          ip,
          key: this.tencentkey,
        })
        if (result.status != 0) {
          result = await this.fetch('http://apis.map.qq.com/ws/location/v1/ip', {
            ip,
            key: this.tencentkey2,
          })
        }
        if (result.status != 0) {
          result = await this.fetch('http://apis.map.qq.com/ws/location/v1/ip', {
            ip,
            key: this.tencentkey3,
          })
        }
        if (result.status == 0) {
          const cityInfo = {
            lat: result.result.location.lat,
            lng: result.result.location.lng,
            city: result.result.ad_info.city,
          }
          cityInfo.city = cityInfo.city.replace(/市$/, '');
          resolve(cityInfo)
        }else{
          console.log('定位失败', result)
          reject('定位失败');
        }
      }catch(err){
        reject(err);
      }
    })
  }

  async searchPlace(keyword, cityName, type = 'search'){
    try {
      const res = await this.fetch('http://apis.map.qq.com/ws/place/v1/search',{
        key: this.tencentkey,
				keyword: encodeURIComponent(keyword),
				boundary: 'region(' + encodeURIComponent(cityName) + ',0)',
				page_size: 20,
      })
      if (res.status == 0) {
        return res
      }
      else{
        throw new Error('搜索位置信息失败')
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}