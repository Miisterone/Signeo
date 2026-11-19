import { createFileRoute } from '@tanstack/react-router'
import { RecoverPasswordPage } from '../../pages/recover-password/recover-password'

export const Route = createFileRoute('/auth/update-password')({
  component: RecoverPasswordPage,
})
