export function isUniversityEmail(email: string): boolean {
  return /@[a-z0-9.-]+\.(edu|ac\.in)$/i.test(email);
}
