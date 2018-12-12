'use strict'

import mongoose from 'mongoose'
import remarkData from '../../InitData/remark'
import cluster from 'cluster'

const remarkSchema = new mongoose.Schema({
	remarks: [],
})

const Remark = mongoose.model('Remark', remarkSchema);

if (cluster.worker.id == 1) {
  Remark.findOne((err, data) => {
    if (err) {
      console.error(err)
    }
    if(!data){
      Remark.create(remarkData)
    }
  })
}

export default Remark