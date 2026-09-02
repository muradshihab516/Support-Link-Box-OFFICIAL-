/**
 * Utility functions for Facebook URL normalization and mobile browser optimization
 */

export function cleanAndFormatFacebookUrl(
  rawUrl: string, 
  variant: 'm' | 'mbasic' | 'www' = 'm'
): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();

  // If no protocol, prepend https://
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Check if it's facebook or fb domain
    if (
      hostname.includes('facebook.com') ||
      hostname.includes('fb.com') ||
      hostname.includes('fb.watch') ||
      hostname.includes('fb.me')
    ) {
      // Set target domain prefix
      if (variant === 'mbasic') {
        parsed.hostname = 'mbasic.facebook.com';
      } else if (variant === 'm') {
        parsed.hostname = 'm.facebook.com';
      } else {
        parsed.hostname = 'www.facebook.com';
      }

      // Remove parameters that trigger native Facebook Lite / FB App interception
      parsed.searchParams.delete('app');
      parsed.searchParams.delete('mibextid');
      parsed.searchParams.delete('substory_index');
      parsed.searchParams.delete('fbclid');
      parsed.searchParams.delete('_rdr');

      return parsed.toString();
    }

    return url;
  } catch {
    // Fallback regex replacement
    if (variant === 'mbasic') {
      return url.replace(/^(https?:\/\/)?([a-z0-9-]+\.)?facebook\.com/i, 'https://mbasic.facebook.com')
        .replace(/[?&]app=fbl/gi, '')
        .replace(/[?&]mibextid=[^&]+/gi, '');
    }
    if (variant === 'm') {
      return url.replace(/^(https?:\/\/)?([a-z0-9-]+\.)?facebook\.com/i, 'https://m.facebook.com')
        .replace(/[?&]app=fbl/gi, '')
        .replace(/[?&]mibextid=[^&]+/gi, '');
    }
    return url;
  }
}

export function openInBrowserSafely(url: string, variant: 'm' | 'mbasic' | 'www' = 'm') {
  const targetUrl = cleanAndFormatFacebookUrl(url, variant);
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}
