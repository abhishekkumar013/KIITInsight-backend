import { Review } from '../models/review.model.js'
import { ErrorHandler } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse'
import { asyncHandler } from '../utils/asynchandler.js'

export const postReview = asyncHandler(async (req, res, next) => {
  const { teacherid, vote } = req.body

  if (!teacherid || vote === undefined) {
    return next(new ErrorHandler('All fields required', 400))
  }

  const existingReview = await Review.findOne({
    userid: req.user._id,
    teacherid,
  })

  if (existingReview) {
    if (existingReview.vote === vote) {
      return next(new ErrorHandler('Already voted with the same value', 400))
    }

    existingReview.vote = vote
    await existingReview.save()
    return res
      .status(200)
      .json(new ApiResponse(200, existingReview, 'Review updated'))
  }

  const newReview = await Review.create({
    userid: req.user._id,
    teacherid,
    vote,
  })
  return res
    .status(201)
    .json(new ApiResponse(201, newReview, 'Review submitted'))
})
