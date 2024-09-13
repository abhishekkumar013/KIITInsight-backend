import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
})

userSchema.methods.generateJWTToken = function () {
  return Jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  )
}

export const User = mongoose.model('User', userSchema)
