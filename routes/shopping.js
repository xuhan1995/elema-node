'use strict'

import express from 'express'
import shop from '../controller/shopping/shop'
import category from '../controller/shopping/category'

const router = express.Router()

router.get('/restaurants', shop.getRestaurants)
router.get('/v2/restaurant/category', category.getCategories)
router.get('/v1/restaurants/delivery_modes', category.getDeliveries)

export default router