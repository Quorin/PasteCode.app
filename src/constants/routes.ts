export const routes = {
  HOME: '/',
  REGISTER: '/register',
  AUTH: {
    LOGIN: '/auth/login',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PROFILE: '/profile',
  SETTINGS: {
    INDEX: '/settings',
    CHANGE_NAME: '/settings/change-name',
    CHANGE_PASSWORD: '/settings/change-password',
    CHANGE_EMAIL: '/settings/change-email',
    REMOVE_ACCOUNT: '/settings/remove-account',
  },
  PASTES: {
    INDEX: '/pastes/[id]',
    RAW: '/pastes/[id]/raw',
    EDIT: '/pastes/[id]/edit',
  },
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_AND_CONDITIONS: '/terms-and-conditions',
}
