const ADMIN_EMAILS = new Set(['binlegal.digital@gmail.com', 'anat.vacaviejavzla@gmail.com', 'contacto@binlegal.com']);
export function isVerifiedAdminEmail(email: string | null | undefined, verified: boolean): boolean {
  return verified && ADMIN_EMAILS.has((email || '').toLowerCase());
}
