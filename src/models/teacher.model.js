import mongoose from 'mongoose'

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: string,
  },
  image: {
    type: String,
  },
  courses: [
    {
      type: String,
    },
  ],
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
})

const Teacher = mongoose.model('Teacher', teacherSchema)

export default Teacher
