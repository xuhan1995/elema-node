'use strict';

import mongoose from 'mongoose'
import paymentsData from '../../InitData/payments'
import cluster from 'cluster';

const paymentsSchema = new mongoose.Schema({
	description: String,
	disabled_reason: String,
	id: Number,
	is_online_payment: Boolean,
	name: String,
	promotion: [],
	select_state: Number,
})

const Payments = mongoose.model('Payments', paymentsSchema);

if (cluster.worker.id == 1) {
  Payments.findOne((err, data) => {
    if (err) {
      console.error(err)
    }
    if (!data) {
      paymentsData.forEach(item => {
        Payments.create(item);
      })
    }
  })	
}

export default Payments