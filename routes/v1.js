'use strict'

import express from 'express'
import CitiesHandler from '../controller/v1/cities'
import SearchPlace from '../controller/v1/search'
import BaseComponent from '../prototype/baseComponent'
import remark from '../controller/v1/remark'

const router = express.Router()
const baseComponent = new BaseComponent()

router.get('/cities', CitiesHandler.getCities)
router.get('/cities/:id', CitiesHandler.getCitiesById)
router.get('/poisition', SearchPlace.search)
router.get('/poisition/:geohash', SearchPlace.getDetailLocation)
router.post('/addimg', baseComponent.uploadImg)
router.get('/carts/:cart_id/remarks', remark.getRemarks)


export default router