'use strict'

import express from 'express'
import citiesHandler from '../controller/v1/cities'
import searchPlace from '../controller/v1/search'
import BaseComponent from '../prototype/baseComponent'
import remark from '../controller/v1/remark'

const router = express.Router()
const baseComponent = new BaseComponent()

router.get('/cities', citiesHandler.getCities)
router.get('/cities/:id', citiesHandler.getCitiesById)
router.get('/poisition', searchPlace.search)
router.get('/poisition/:geohash', searchPlace.getDetailLocation)
router.post('/addimg', baseComponent.uploadImg)
router.get('/carts/:cart_id/remarks', remark.getRemarks)


export default router