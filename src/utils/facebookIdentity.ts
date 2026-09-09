/**
 * Facebook Identity Verification, Profile Extraction, and Name Normalization Utilities
 * Designed specifically for Support Link Box & GapChecker Pro integration
 */

export interface FacebookProfileValidationResult {
  isValid: boolean;
  isShareLink?: boolean;
  normalizedFbId?: string;
  canonicalUrl?: string;
  type?: 'numeric_id' | 'username';
  error?: string;
  warning?: string;
}

/**
 * Normalizes a Facebook Name for GapChecker & database fuzzy matching
 * 1. Converts to lowercase
 * 2. Removes emoji characters and special symbols
 * 3. Strips punctuation (dots, commas, dashes, brackets, quotes)
 * 4. Collapses multiple whitespace into a single space
 * 5. Trims leading/trailing whitespace
 * 
 * Example:
 * "Md. Shihab Khan (শাহীন) 🔥" -> "md shihab khan শাহীন"
 */
export function normalizeFacebookName(rawName: string): string {
  if (!rawName || typeof rawName !== 'string') return '';
  
  // Normalize unicode (NFKD)
  let normalized = rawName.normalize('NFKD');

  // Convert to lowercase
  normalized = normalized.toLowerCase();

  // Strip emoji characters and common decorative symbols
  normalized = normalized.replace(/[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  // Strip punctuation and special characters while preserving Bengali and Latin letters and numbers
  // Bengali unicode block: \u0980-\u09FF
  // English letters: a-z
  // Numbers: 0-9 and Bengali digits \u09E6-\u09EF
  normalized = normalized.replace(/[^\u0980-\u09FFa-z0-9\s]/gi, ' ');

  // Collapse consecutive whitespaces and trim
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Validates a Facebook profile link and extracts the unique normalized_fb_id
 * Prevents generic share links like https://www.facebook.com/share/1ch6FHYwu5/
 * Allows:
 * - https://www.facebook.com/profile.php?id=61591074116901
 * - https://www.facebook.com/people/Name/61591074116901
 * - https://www.facebook.com/username
 * - https://m.facebook.com/...
 */
export function validateAndExtractFacebookId(rawUrl: string): FacebookProfileValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return {
      isValid: false,
      error: 'ফেসবুক প্রোফাইল লিংক প্রদান করা বাধ্যতামূলক।'
    };
  }

  let urlString = rawUrl.trim();

  // If missing protocol, prepend https://
  if (!/^https?:\/\//i.test(urlString)) {
    urlString = 'https://' + urlString;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return {
      isValid: false,
      error: 'সঠিক ফরম্যাটের URL প্রদান করুন (যেমন: https://www.facebook.com/profile.php?id=...)'
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    !hostname.includes('facebook.com') && 
    !hostname.includes('fb.com') && 
    !hostname.includes('fb.me')
  ) {
    return {
      isValid: false,
      error: 'শুধুমাত্র বৈধ Facebook প্রোফাইল লিংক গ্রহণযোগ্য।'
    };
  }

  const pathname = parsed.pathname;
  const searchParams = parsed.searchParams;

  // 1. Critical Check: Reject Share Links (/share/...)
  // Share links like /share/1ch6FHYwu5/ are temporary referral redirects, not stable profile identifiers!
  if (pathname.includes('/share/')) {
    return {
      isValid: false,
      isShareLink: true,
      error: '⚠️ এটি একটি ফেসবুক শেয়ার লিংক (/share/...)! এটি কোনো আসল প্রোফাইল আইডি নয়। অনুগ্রহ করে ফেসবুক বা ফেসবুক লাইট অ্যাপে আপনার প্রোফাইলে যান → ৩-ডট মেনু (•••) তে চাপুন → "Copy link to profile" থেকে আসল প্রোফাইল লিংক (যেমন: facebook.com/profile.php?id=... অথবা facebook.com/username) কপি করে দিন।'
    };
  }

  // 2. Reject Group, Page Post, Reel, or Video Links
  if (
    pathname.includes('/groups/') ||
    pathname.includes('/posts/') ||
    pathname.includes('/videos/') ||
    pathname.includes('/reel/') ||
    pathname.includes('/photo/') ||
    pathname.includes('/watch/') ||
    pathname.includes('/events/')
  ) {
    return {
      isValid: false,
      error: '⚠️ এটি কোনো ফেসবুক পোস্ট, রিল বা গ্রুপ লিংক! অনুগ্রহ করে আপনার ব্যক্তিগত ফেসবুক প্রোফাইল লিংক প্রদান করুন।'
    };
  }

  // 3. Case A: Numeric Profile ID via query param (profile.php?id=61591074116901)
  if (pathname.includes('profile.php') && searchParams.has('id')) {
    const idParam = searchParams.get('id')!.trim();
    if (/^\d+$/.test(idParam)) {
      return {
        isValid: true,
        normalizedFbId: idParam,
        canonicalUrl: `https://www.facebook.com/profile.php?id=${idParam}`,
        type: 'numeric_id'
      };
    }
  }

  // 4. Case B: Facebook People format (facebook.com/people/Name/61591074116901)
  const peopleMatch = pathname.match(/\/people\/[^/]+\/(\d+)/i);
  if (peopleMatch && peopleMatch[1]) {
    const numericId = peopleMatch[1];
    return {
      isValid: true,
      normalizedFbId: numericId,
      canonicalUrl: `https://www.facebook.com/profile.php?id=${numericId}`,
      type: 'numeric_id'
    };
  }

  // 5. Case C: Vanity Username (facebook.com/username)
  // Clean up path parts
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
  const pathParts = cleanPath.split('/').filter(Boolean);

  if (pathParts.length === 1) {
    const rawUsername = pathParts[0].toLowerCase();

    // Blacklist reserved Facebook system paths
    const reservedPaths = [
      'home.php', 'index.php', 'login', 'recover', 'help', 
      'settings', 'messages', 'notifications', 'marketplace', 
      'gaming', 'watch', 'pages', 'saved', 'bookmarks'
    ];

    if (reservedPaths.includes(rawUsername)) {
      return {
        isValid: false,
        error: 'এটি কোনো ব্যক্তিগত ফেসবুক প্রোফাইল লিংক নয়।'
      };
    }

    // Clean username (alphanumeric with dots, underscores, dashes)
    const cleanUsername = rawUsername.replace(/[^a-z0-9._-]/g, '');

    if (cleanUsername.length >= 2) {
      // Check if username is purely numeric (rare, treat as numeric ID)
      if (/^\d{6,}$/.test(cleanUsername)) {
        return {
          isValid: true,
          normalizedFbId: cleanUsername,
          canonicalUrl: `https://www.facebook.com/profile.php?id=${cleanUsername}`,
          type: 'numeric_id'
        };
      }

      return {
        isValid: true,
        normalizedFbId: cleanUsername,
        canonicalUrl: `https://www.facebook.com/${cleanUsername}`,
        type: 'username'
      };
    }
  }

  return {
    isValid: false,
    error: 'প্রোফাইল লিংক শনাক্ত করা যায়নি। অনুগ্রহ করে ফেসবুক প্রোফাইলের সঠিক লিংক প্রদান করুন (যেমন: https://www.facebook.com/profile.php?id=... অথবা https://www.facebook.com/username)'
  };
}

/**
 * Calculates similarity percentage between two names (0 to 100)
 * Uses Levenshtein distance on normalized strings
 */
export function calculateNameSimilarity(nameA: string, nameB: string): {
  score: number;
  matchType: 'exact' | 'normalized_exact' | 'high_similarity' | 'moderate' | 'mismatch';
} {
  if (!nameA || !nameB) {
    return { score: 0, matchType: 'mismatch' };
  }

  if (nameA.trim() === nameB.trim()) {
    return { score: 100, matchType: 'exact' };
  }

  const normA = normalizeFacebookName(nameA);
  const normB = normalizeFacebookName(nameB);

  if (normA === normB && normA.length > 0) {
    return { score: 100, matchType: 'normalized_exact' };
  }

  // Token matching (e.g. "Md. Shihab Khan" vs "Shihab Khan")
  const tokensA = normA.split(' ').filter(Boolean);
  const tokensB = normB.split(' ').filter(Boolean);

  const setA = new Set(tokensA);
  const common = tokensB.filter(t => setA.has(t));
  const tokenOverlap = (common.length * 2) / (tokensA.length + tokensB.length);

  // Levenshtein distance
  const lenA = normA.length;
  const lenB = normB.length;
  if (lenA === 0 || lenB === 0) return { score: 0, matchType: 'mismatch' };

  const matrix: number[][] = [];
  for (let i = 0; i <= lenB; i++) matrix[i] = [i];
  for (let j = 0; j <= lenA; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      if (normB.charAt(i - 1) === normA.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const distance = matrix[lenB][lenA];
  const maxLen = Math.max(lenA, lenB);
  const levenshteinScore = Math.max(0, Math.round((1 - distance / maxLen) * 100));

  // Combined score giving weight to both token overlap and edit distance
  const finalScore = Math.round(levenshteinScore * 0.6 + tokenOverlap * 100 * 0.4);

  if (finalScore >= 85) {
    return { score: finalScore, matchType: 'high_similarity' };
  } else if (finalScore >= 65) {
    return { score: finalScore, matchType: 'moderate' };
  } else {
    return { score: finalScore, matchType: 'mismatch' };
  }
}
