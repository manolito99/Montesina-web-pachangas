export const ADMIN_EMAILS = ["nolomanolo990@gmail.com"];

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}
