import { School } from '../models/school.model.js'
import { ErrorHandler } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asynchandler.js'

export const createSchool = asyncHandler(async (req, res, next) => {
  try {
    const { school } = req.body
    if (!school) {
      return next(new ErrorHandler('School name is required', 404))
    }
    const newschool = await School.create({ school })
    return res
      .status(200)
      .json(new ApiResponse(200, newschool, 'New school created'))
  } catch (error) {
    next(error)
  }
})

export const getAllSchool = asyncHandler(async (req, res, next) => {
  try {
    const school = await School.find()
    if (!school) {
      return next(new ErrorHandler('No school data found', 404))
    }
    return res
      .status(200)
      .json(new ApiResponse(200, school, 'All school list fetched'))
  } catch (error) {
    next(error)
  }
})
