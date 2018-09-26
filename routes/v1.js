'use strict'

import express from 'express'
import CitiesHandler from '../controller/v1/cities'

const router = express.Router()

router.get('/cities', CitiesHandler.getCities)

export default router