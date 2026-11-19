import { createFileRoute } from '@tanstack/react-router'
import { ProfilePasswordPage } from '../../pages/profile-password/profile-password'

export const Route = createFileRoute('/_authenticated/profil_/update-password')({
  component: ProfilePasswordPage,
})
