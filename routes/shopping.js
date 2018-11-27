'use strict'

import express from 'express'
import shop from '../controller/shopping/shop'
import Category from '../controller/shopping/category'

const router = express.Router()

router.get('/restaurants', shop.getRestaurants)
router.get('/v2/restaurant/category', Category.getCategories)

export default router