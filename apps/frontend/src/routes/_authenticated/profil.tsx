import { createFileRoute } from '@tanstack/react-router'
import { ProfilPage } from '../../pages/profil/profil'

export const Route = createFileRoute('/_authenticated/profil')({
  component: ProfilPage,
})