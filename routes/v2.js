'use strict'

import express from 'express'
import entry from '../controller/v2/foodCategories'

const router = express.Router()

router.get('/foodCategories', entry.getFoodCategories)

export default router
