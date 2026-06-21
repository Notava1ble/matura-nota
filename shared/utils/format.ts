export function formatSubject(subject: string): string {
  return subject
    .replace(/\.json$/i, "")
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
