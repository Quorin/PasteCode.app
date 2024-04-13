export const routes = {
  HOME: '/',
  REGISTER: '/register',
  AUTH: {
    LOGIN: '/login',
    RESET_PASSWORD: '/reset-password',
  },
  PROFILE: '/profile',
  SETTINGS: {
    INDEX: '/settings',
    CHANGE_PASSWORD: '/settings/change-password',
    CHANGE_EMAIL: '/settings/change-email',
    REMOVE_ACCOUNT: '/settings/remove-account',
  },
  PASTES: {
    INDEX: '/pastes/[id]',
    RAW: '/pastes/[id]/raw',
    EDIT: '/pastes/[id]/edit',
    FORK: '/pastes/[id]/fork',
  },
  PRIVACY_POLICY: '/policy',
  TERMS_AND_CONDITIONS: '/terms',
}
