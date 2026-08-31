export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  seniority: number | null;
  hiredAt: string | null;
  isActive: boolean;
  managerId: string | null;
}
