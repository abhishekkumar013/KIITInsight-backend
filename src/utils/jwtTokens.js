import { asyncHandler } from './asynchandler.js'
import { ApiResponse } from './apiResponse.js'

export const sendToken = asyncHandler(
  async (user, statusCode, res, message) => {
    try {
      const token = await user.generateAccessToken()

      const options = {
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
        ),
        httpOnly: true,
        secure: true,
      }

      res
        .status(statusCode)
        .cookie('token', token, options)
        .json(new ApiResponse(statusCode, { user, token: token }, message))
    } catch (error) {
      next(error)
    }
  },
)
