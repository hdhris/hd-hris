export function getSimilarityPercentage(str1: string, str2: string): number {
    // Normalize the strings by removing non-alphanumeric characters, lowering case, and trimming spaces
    const cleanString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  
    const s1 = cleanString(str1);
    const s2 = cleanString(str2);
  
    // Calculate Levenshtein distance between two strings
    function levenshteinDistance(a: string, b: string): number {
      const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  
      for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1, // deletion
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j - 1] + cost // substitution
          );
        }
      }
  
      return matrix[a.length][b.length];
    }
  
    // Calculate similarity score
    const maxLength = Math.max(s1.length, s2.length);
    const levDistance = levenshteinDistance(s1, s2);
    const similarity = 1 - levDistance / maxLength;
  
    // Return a percentage match
    return Math.round(similarity * 100);
  }