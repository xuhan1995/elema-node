'use strict'

import fetch from 'node-fetch'

export default class BaseComponent {
  constructor(){
    
  }

  async fetch(url = '', data = {}, type = 'GET', resType = 'JSON'){
    type = type.toUpperCase()
    resType = resType.toUpperCase()
    if (type === 'GET') {
      let queryString = ''
      Object.keys(data).forEach(key => {
        queryString += key + '=' + data[key] + '&'
      })
      if (queryString) {
        queryString = queryString.substr(0, queryString.lastIndexOf('&'))
        url += '?' + queryString
      }
    }

    let requestConfig = {
			method: type,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
    }
    
    if (type === 'POST') {
      requestConfig.body = JSON.stringify(data)
    }

    let responseConent
    
    try {
      const response = await fetch(url, requestConfig)
      if (resType === 'TEXT') {
        responseConent = await response.text()
      }else{
        responseConent = await response.json()        
      }
    } catch (error) {
      console.log('获取http数据失败', err);
    }
    return responseConent
  }
  
}