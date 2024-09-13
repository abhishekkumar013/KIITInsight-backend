import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teacherid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  vote: {
    type: String,
    enum: ['UpVote', 'DownVote'],
    default: '',
  },
})

export const Review = mongoose.model('Review', reviewSchema)
