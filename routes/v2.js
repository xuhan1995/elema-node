'use strict'

import express from 'express'
import entry from '../controller/v2/foodCategories'
import user from '../controller/v2/user'

const router = express.Router()

router.get('/foodCategories', entry.getFoodCategories)
router.post('/register', user.register)
router.post('/login', user.login)

export default router
