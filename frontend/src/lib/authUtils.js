/**
 * Check if the current user is an admin
 * @param {Object} user - The user object from UserContext
 * @returns {boolean} - True if user is admin, false otherwise
 */
export const isAdmin = (user) => {
  return user?.isAuthenticated && user?.role === 'Admin';
};

/**
 * Check if the current user is authenticated
 * @param {Object} user - The user object from UserContext
 * @returns {boolean} - True if user is authenticated, false otherwise
 */
export const isAuthenticated = (user) => {
  return user?.isAuthenticated === true;
};

/**
 * Get user role from token
 * @param {string} token - JWT token
 * @returns {string|null} - User role or null if invalid
 */
export const getRoleFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};
