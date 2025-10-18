export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}