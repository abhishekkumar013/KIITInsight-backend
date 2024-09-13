import Teacher from '../models/teacher.model.js'
import { ErrorHandler } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asynchandler.js'

export const postTeacher = asyncHandler(async (req, res, next) => {
  try {
    const { name, subjects, email, image, school } = req.body

    let courses
    if (Array.isArray(subjects)) {
      // Multiple courses selected
      courses = subjects
    } else {
      // Single course selected
      courses = [subjects]
    }

    if (!name || !school || !email || !image) {
      return next(new ErrorHandler('All fields required', 404))
    }
    const teacherData = {
      name,
      courses,
      email,
      image,
      school,
    }

    // if (req.file && req.file?.path) {
    //   try {
    //     const imageLocalPath = req.file?.path
    //     console.log(imageLocalPath)
    //     const image = await uploadOnCloudinary(imageLocalPath)

    //     console.log(image)
    //     if (!image || !image?.url) {
    //       return next(new ErrorHandler('Error In image Uploading', 500))
    //     }
    //     teacherData.image = {
    //       public_id: image.public_id,
    //       url: image.url,
    //     }
    //   } catch (error) {
    //     return next(new ErrorHandler('Failed to upload image', 500))
    //   }
    // }
    const teacher = await Teacher.create(teacherData)

    return res
      .status(200)
      .json(new ApiResponse(200, teacher, 'New Teacher Added'))
  } catch (error) {
    next(error)
  }
})

export const getAllTeachers = asyncHandler(async (req, res, next) => {
  try {
    const teachers = await Teacher.find().populate('school', 'name')
    if (!teachers) {
      return next(new ErrorHandler('No Teeachher Data Found', 404))
    }

    return res
      .status(200)
      .json(new ApiResponse(200, teachers, 'Teacher List Fetched Successfully'))
  } catch (error) {
    next(error)
  }
})
export const getTeacherofSchool = asyncHandler(async (req, res, next) => {
  try {
    const schoolid = req.params.id

    const teachers = await Teacher.find({ school: schoolid }).populate(
      'school',
      'name',
    )

    if (!teachers) {
      return next(new ErrorHandler('No Teahcher Found', 404))
    }
    return res
      .status(200)
      .json(new ApiResponse(200, teachers, 'Teacher list fetched'))
  } catch (error) {
    next(error)
  }
})

export const getTeacherAllVote = asyncHandler(async (req, res, next) => {
  try {
    const { teacherId } = req.body

    if (!teacherId) {
      return next(new ErrorHandler('Teacher ID is required', 400))
    }

    const teacher = await Teacher.findById(teacherId)

    if (!teacher) {
      return next(new ErrorHandler('Teacher not found', 404))
    }

    const voteCount = await Review.aggregate([
      {
        $match: { teacherid: teacher._id },
      },
      {
        $group: {
          _id: '$vote',
          count: { $sum: 1 },
        },
      },
    ])

    const result = {
      teacherId: teacher._id,
      teacherName: teacher.name,
      email: teacher.email,
      courses: teacher.courses,
      upvotes: 0,
      downvotes: 0,
    }

    voteCount.forEach((vote) => {
      if (vote._id === 'UpVote') {
        result.upvotes = vote.count
      } else if (vote._id === 'DownVote') {
        result.downvotes = vote.count
      }
    })

    res
      .status(200)
      .json(new ApiResponse(200, result, 'Vote count retrieved successfully'))
  } catch (error) {
    next(error)
  }
})
// export const getAllTeachersWithVotes2 = asyncHandler(async (req, res, next) => {
//   try {
//     const teachers = await Teacher.find({}).lean()

//     // Get vote counts for all teachers
//     const voteCounts = await Review.aggregate([
//       {
//         $group: {
//           _id: { teacherId: '$teacherid', vote: '$vote' },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $group: {
//           _id: '$_id.teacherId',
//           votes: {
//             $push: {
//               type: '$_id.vote',
//               count: '$count',
//             },
//           },
//         },
//       },
//     ])

//     // Create a map of teacher IDs to vote counts
//     const voteCountMap = new Map(
//       voteCounts.map((vc) => [vc._id.toString(), vc.votes]),
//     )

//     // Combine teacher data with vote counts
//     const teachersWithVotes = teachers.map((teacher) => {
//       const votes = voteCountMap.get(teacher._id.toString()) || []
//       const upvotes = votes.find((v) => v.type === 'UpVote')?.count || 0
//       const downvotes = votes.find((v) => v.type === 'DownVote')?.count || 0

//       return {
//         ...teacher,
//         upvotes,
//         downvotes,
//       }
//     })

//     res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           teachersWithVotes,
//           'Teachers with vote counts retrieved successfully',
//         ),
//       )
//   } catch (error) {
//     next(error)
//   }
// })

export const getAllTeachersWithVotes = async (req, res) => {
  try {
    const teachersWithVotes = await Teacher.aggregate([
      // Lookup to join with the School collection
      {
        $lookup: {
          from: 'schools',
          localField: 'school',
          foreignField: '_id',
          as: 'schoolInfo',
        },
      },
      // Unwind the schoolInfo array
      {
        $unwind: {
          path: '$schoolInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup to join with the Review collection
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'teacherid',
          as: 'reviews',
        },
      },
      // Group to count upvotes and downvotes
      {
        $addFields: {
          upvotes: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'review',
                cond: { $eq: ['$$review.vote', 'UpVote'] },
              },
            },
          },
          downvotes: {
            $size: {
              $filter: {
                input: '$reviews',
                as: 'review',
                cond: { $eq: ['$$review.vote', 'DownVote'] },
              },
            },
          },
        },
      },
      // Project to shape the final output
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          courses: 1,
          email: 1,
          schoolName: '$schoolInfo.name',
          upvotes: 1,
          downvotes: 1,
        },
      },
    ])

    res
      .status(200)
      .json(new ApiResponse(200, teachersWithVotes, 'All Teacher Data fetched'))
  } catch (error) {
    next(error)
  }
}
