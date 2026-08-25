import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordPage } from '../../pages/reset-password/reset-password'

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
})
