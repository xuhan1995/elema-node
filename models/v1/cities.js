'use strict'

import mongoose from 'mongoose'
import citiesData from '../../initData/cities'

const citySchema = new mongoose.Schema({
  data: {}
})

citySchema.statics.citiesGroup = function(){
  return new Promise( async(resolve, reject) => {
    try{
      const cities = await this.findOne()
      const citiesObj = cities.data
      delete citiesObj.hotCities
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

const Cities = mongoose.model('Cities', citySchema)

Cities.findOne((err,data) => {
 try {
   if (!data) {
     Cities.create({data: citiesData})
   }
 } catch (error) {
   console.error(error)
 } 
})

export default Cities