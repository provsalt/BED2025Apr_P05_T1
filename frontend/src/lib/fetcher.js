import {useContext} from "react";
import {UserContext} from "@/provider/UserContext.js";

/**
 * A simple fetch wrapper that adds your `localStorage` token
 * to the Authorization header as a Bearer token.
 *
 * @param {string} url    The URL to fetch
 * @param {object} opts   Fetch options (headers, method, body, etc.)
 * @returns {Promise<any>} Parsed JSON response
 */
export async function fetcher(url, opts = {}) {
  const headers = new Headers(opts.headers || {});

  const token = localStorage.getItem('token');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_BACKEND_URL}/api${url}`;

  const response = await fetch(fullUrl, {
    ...opts,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error || errorText);
    } catch (parseError) {
      throw new Error(errorText);
    }
  }

  try {
    return await response.json();
  } catch (parseError) {
    throw new Error('Invalid JSON response from server');
  }
}