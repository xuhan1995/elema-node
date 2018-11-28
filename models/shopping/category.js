'use strict'

import mongoose from 'mongoose'
import categoryData from '../../initData/category'
import cluster from 'cluster'

const categorySchema = new mongoose.Schema({
  count: Number,
	id: Number,
	ids: [],
	image_url: String,
	level: Number,
	name: String,
	sub_categories: [
		{
			count: Number,
			id: Number,
			image_url: String,
			level: Number,
			name: String
		},
	]
})

const Category = mongoose.model('Category', categorySchema)

if (cluster.worker.id == 1) {
	Category.findOne((err, data) => {
		if (err) {
			throw err
		}
		if (!data) {
			for (let i = 0; i < categoryData.length; i++) {
				Category.create(categoryData[i])
			}
		}
	})
}


export default Category