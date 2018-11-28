'use strict'

import mongoose from 'mongoose'
import deliveryData from '../../initData/delivery'
import cluster from 'cluster'

const deliverySchema = new mongoose.Schema({
  color: String,
	id: Number,
	is_solid: Boolean,
	text: String
})

deliverySchema.index({id: 1})

const delivery = mongoose.model('delivery', deliverySchema)
if (cluster.worker.id == 1) {
  delivery.findOne((err, data) => {
    if (err) {
      throw err
    }
    if (!data) {
      delivery.create(deliveryData)
    }
  })
}

export default delivery

