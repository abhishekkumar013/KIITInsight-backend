import express from 'express'
import passport from 'passport'

const router = express.Router()

router
  .route('/auth/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }))

router.route('/auth/google/callback').get(
  passport.authenticate('google', {
    failureRedirect: '/api/v1/user/auth/failure',
    failureMessage: true,
  }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:5173')
  },
)

router.route('/auth/failure').get((req, res) => {
  const errorMessage = req.session.messages
    ? encodeURIComponent(req.session.messages[0])
    : 'Authentication failed'
  // Clear the error message
  req.session.messages = []
  // Redirect to the frontend with the error message
  res.redirect(`http://localhost:5173?error=${errorMessage}`)
})

router.route('/login/success').get(async (req, res) => {
  if (req.user) {
    return res.status(200).json({ message: 'user login', user: req.user })
  } else {
    return res.status(400).json({ message: 'user Not login', user: null })
  }
})

router.route('/logout').get((req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out', error: err })
    }
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'Error destroying session', error: err })
      }
      res.clearCookie('connect.sid') // Or whatever your session cookie name is
      return res.status(200).json({ message: 'Logged out successfully' })
    })
  })
})

export default router
