'use strict'

import mongoose from 'mongoose'
import citiesData from '../../initData/cities'

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

const Cities = mongoose.model('Cities', citySchema)

Cities.findOne((err,data) => {
 try {
   if (!data) {
     Cities.create({data: citiesData})
   }
 } catch (err) {
   console.error(err)
 } 
})

export default Cities