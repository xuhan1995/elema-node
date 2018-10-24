'use strict'

import express from 'express'
import getFoodCategories from '../controller/v2/foodCategories'

const router = express.Router()

router.get('/foodCategories', getFoodCategories)

export default router
