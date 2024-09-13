import dotenv from 'dotenv'
import { app } from './app.js'
import connectDb from './config/db.js'
import { errorMiddleware } from './utils/apiError.js'

dotenv.config({
  path: './.env',
})

connectDb()
  .then(() => {
    const PORT = process.env.PORT || 8080
    app.listen(PORT, () => {
      console.log('Server Start at ', PORT)
    })
  })
  .catch((err) => {
    console.log('MONGO ERROR', err)
  })

app.use(errorMiddleware)
