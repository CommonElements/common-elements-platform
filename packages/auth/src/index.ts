// Middleware exports
export { updateSession } from './middleware'

// Session management exports
export { getSession, getUser, signOut } from './session'

// Auth utility exports
export {
  requireAuth,
  getUserProfile,
  hasCompletedOnboarding,
  requireOnboarding,
} from './utils'
