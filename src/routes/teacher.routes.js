import express from 'express'
import { upload } from '../middleware/multer.middleware'
import { postTeacher } from '../controllers/teacher.controller'

const router = express.Router()

router.post('/post', postTeacher)

export default router
