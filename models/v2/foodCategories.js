'use strict'

import mongoose from 'mongoose'
import foodCategoriesData from '../../initData/foodCategories'
import cluster from 'cluster'

const foodCategoriesSchema = new mongoose.Schema({
  id: Number,
  is_in_serving: Boolean,
  description: String,
  title: String,
  link: String,
  image_url: String,
  icon_url: String,
  title_color: String
})

const foodCategories = mongoose.model('foodCategory', foodCategoriesSchema)

if (cluster.worker.id == 1) {
  foodCategories.findOne((err, data) => {
    if (err) {
      throw err
    }
    if (!data) {
      for (let i = 0; i < foodCategoriesData.length; i++) {
        foodCategories.create(foodCategoriesData[i])
      }
    }
  })
}

export default foodCategories



