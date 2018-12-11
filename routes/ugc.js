'use strict'

import express from 'express'
import rating from '../controller/ugc/rating'

const router = express.Router()

router.get('/v2/restaurants/:restaurant_id/ratings', rating.getRatings)

export default router