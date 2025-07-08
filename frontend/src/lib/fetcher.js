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

  const response = await fetch(url, {
    ...opts,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error fetching: ${errorText}`
    );
  }

  return response.json();
}