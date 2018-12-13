'use strict'

import express from 'express'
import citiesHandler from '../controller/v1/cities'
import searchPlace from '../controller/v1/search'
import BaseComponent from '../prototype/baseComponent'
import remark from '../controller/v1/remark'
import address from '../controller/v1/address'
import captchas from '../controller/v1/captchas'
import cart from '../controller/v1/cart'

const router = express.Router()
const baseComponent = new BaseComponent()

router.get('/cities', citiesHandler.getCities)
router.get('/cities/:id', citiesHandler.getCitiesById)
router.get('/poisition', searchPlace.search)
router.get('/poisition/:geohash', searchPlace.getDetailLocation)
router.post('/addimg', baseComponent.uploadImg)
router.get('/carts/:cart_id/remarks', remark.getRemarks)
router.get('/users/:user_id/address', address.getAddress)
router.post('/captchas', captchas.getCaptchas)
router.post('/users/:user_id/address', address.addAddress)
router.delete('/users/:user_id/address/:address_id', address.deleteAddress)
router.post('/carts/checkout', cart.checkout)

export default router