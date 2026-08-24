import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '../../pages/dashboard/dashboard'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})