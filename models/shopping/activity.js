'use strict'

import mongoose from 'mongoose'
import activityData from '../../initData/activity'

const activitySchema = new mongoose.Schema({
	description: String,
	icon_color: String,
	icon_name: String,
	id: Number,
	name: String,
	ranking_weight: Number
})

const Activity = mongoose.model('Activity', activitySchema)

Activity.findOne((err, data) => {
  if (err) {
    throw err
  }
  if (!data) {
    for (let i = 0; i < activityData.length; i++) {
      Activity.create(activityData[i])
    }
  }
})

export default Activity