/**
 * Shared Firebase REST API fetch utility with retry logic
 *
 * This utility provides robust Firebase Realtime Database fetching with:
 * - Retry logic (3 attempts with exponential backoff)
 * - Timeout handling (15 seconds)
 * - Proper error logging
 * - Cache disabling
 */

/**
 * Fetch data from Firebase Realtime Database REST API
 *
 * @param path - Firebase database path (e.g., 'users', 'stores', 'payout_requests')
 * @param retries - Number of retry attempts (default: 3)
 * @returns Promise<any> - The fetched data
 * @throws Error if all retry attempts fail or database URL is not configured
 */
export async function fetchFirebase(path: string, retries = 3): Promise<any> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  // Validate database URL
  if (!dbUrl) {
    console.error('❌ NEXT_PUBLIC_FIREBASE_DATABASE_URL is not defined');
    throw new Error('Firebase database URL not configured');
  }

  const url = `${dbUrl}/${path}.json`;
  console.log(`🔄 Fetching: ${path} from ${url}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 0 } // Disable caching
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log(`✅ Successfully fetched: ${path}`);
      return data;

    } catch (error: any) {
      console.error(`❌ Attempt ${attempt}/${retries} failed for ${path}:`, error.message);

      if (attempt === retries) {
        // Last attempt failed
        if (error.name === 'AbortError') {
          throw new Error(`Timeout fetching ${path} after 15 seconds`);
        }
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error(`Failed to fetch ${path} after ${retries} attempts`);
}
