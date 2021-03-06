'use strict'

import express from 'express'
import rating from '../controller/ugc/rating'

const router = express.Router()

router.get('/v2/restaurants/:restaurant_id/ratings', rating.getRatings)
router.get('/v2/restaurants/:restaurant_id/ratings/scores', rating.getRatings)
router.get('/v2/restaurants/:restaurant_id/ratings/tags', rating.getRatings)

export default router