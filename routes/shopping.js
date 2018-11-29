'use strict'

import express from 'express'
import shop from '../controller/shopping/shop'
import category from '../controller/shopping/category'
import check from '../middlewares/check'

const router = express.Router()

router.get('/restaurants', shop.getRestaurants)
router.get('/restaurant/:shopid', shop.getRestaurantDetail)
router.get('/v2/restaurant/category', category.getCategories)
router.get('/v1/restaurants/delivery_modes', category.getDeliveries)
router.get('/v1/restaurants/activity_attributes', category.getActivities)
router.post('/addshop', check.checkAdmin, shop.addShop)

export default router