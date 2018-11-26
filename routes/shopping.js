'use strict'

import express from 'express'
import shop from '../controller/shopping/shop'

const router = express.Router()

router.get('/restaurants', shop.getRestaurants)

export default router