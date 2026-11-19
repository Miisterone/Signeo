import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordPage } from '../../pages/forgot-password/forgot-password'

export const Route = createFileRoute('/auth/reset-password')({
  component: ForgotPasswordPage,
})
