import { createFileRoute } from '@tanstack/react-router'
import { ChangePasswordPage } from '../../pages/change-password/change-password'

export const Route = createFileRoute('/_authenticated/profil_/update-password')({
  component: ChangePasswordPage,
})
