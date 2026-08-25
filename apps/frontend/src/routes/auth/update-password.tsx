import { createFileRoute } from '@tanstack/react-router'
import { UpdatePasswordPage } from '../../pages/update-password/update-password'

export const Route = createFileRoute('/auth/update-password')({
  component: UpdatePasswordPage,
})
