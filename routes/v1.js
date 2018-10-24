'use strict'

import express from 'express'
import CitiesHandler from '../controller/v1/cities'
import SearchPlace from '../controller/v1/search'

const router = express.Router()

router.get('/cities', CitiesHandler.getCities)
router.get('/cities/:id', CitiesHandler.getCitiesById)
router.get('/poisition', SearchPlace.search)
router.get('/poisition/:geohash', SearchPlace.getDetailLocation)

export default router