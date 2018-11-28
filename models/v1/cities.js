'use strict'

import mongoose from 'mongoose'
import citiesData from '../../initData/cities'
import cluster from 'cluster'

const citySchema = new mongoose.Schema({
  data: {}
})

citySchema.statics.citiesGroup = function(){
  return new Promise( async(resolve, reject) => {
    try{
      const {data} = await this.findOne()
      const {hotCities,...citiesObj} = data
      resolve(citiesObj)
    }
    catch(err){
      reject({
				name: 'ERROR_DATA',
				message: '查找数据失败',
      })
      console.error(error)
    }
  })
}

citySchema.statics.citiesHot = function(){
  return new Promise( async(resolve, reject) => {
    try{
      const {data:{hotCities}} = await this.findOne()
      const citiesHot = hotCities
      resolve(citiesHot)
    }
    catch(err){
      reject({
				name: 'ERROR_DATA',
				message: '查找数据失败',
      })
      console.error(error)      
    }
  })
}

citySchema.statics.citiesGuess = function(cityName){
  return new Promise( async(resolve, reject) => {
    let firstWord = cityName.substr(0,1).toUpperCase()
    try{
      const {data} = await this.findOne()
      const citiesGuess = Object.entries(data).find(ele => ele[0] === firstWord)[1].find(ele => ele.pinyin === cityName)
      resolve(citiesGuess)
    }
    catch(err){
      reject({
				name: 'ERROR_DATA',
				message: '查找数据失败',
      })
      console.error(error)      
    }
  })
}

citySchema.statics.getCitiesById = function(id){
  return new Promise(async(resolve, reject) => {
    try {
      const {data} = await this.findOne()
      const {hotCities,...citiesObj} = data
      Object.values(citiesObj).forEach(citiesArr => {
        citiesArr.forEach(ele => {
          if (ele.id == id) {
            resolve(ele)
          }
        })
      })
    } catch (error) {
      reject({
				name: 'ERROR_DATA',
				message: '查找数据失败',
      })
      console.error(error)  
    }
  })
}

const Cities = mongoose.model('Cities', citySchema)

if (cluster.worker.id == 1) {
  Cities.findOne((err, data) => {
    if (err) {
      throw err
    }
    if (!data) {
      Cities.create({data: citiesData})
    }
  })
}

export default Cities