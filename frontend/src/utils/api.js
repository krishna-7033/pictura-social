import axios from 'axios';
import { DEFAULT_TENANT_SLUG, resolveApiBaseUrl } from './apiConfig';

const AUTH_STORAGE_KEY = 'ig_auth_state';
const API_BASE_URL = resolveApiBaseUrl();

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Add tenant header and JWT token to all requests
apiClient.interceptors.request.use(
    (config) => {
        config.headers['x-tenant-slug'] = DEFAULT_TENANT_SLUG;

        // Add JWT token from localStorage to Authorization header
        try {
            const authState = localStorage.getItem(AUTH_STORAGE_KEY);
            if (authState) {
                const parsed = JSON.parse(authState);
                if (parsed?.token) {
                    config.headers.Authorization = `Bearer ${parsed.token}`;
                }
            }
        } catch (err) {
            console.error('Failed to attach JWT token:', err);
        }

        return config;
    },
    (error) => Promise.reject(error),
);

/**
 * Posts API
 */
export const postsApi = {
    // Get all posts
    getAll: async () => {
        try {
            const response = await apiClient.get('/api/posts');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            return [];
        }
    },

    // Create a new post
    create: async (imageUrl, caption) => {
        try {
            const response = await apiClient.post('/api/posts/create-post', {
                imageUrl,
                caption,
            });
            return response.data;
        } catch (error) {
            console.error('Failed to create post:', error);
            throw error;
        }
    },

    // Like a post
    like: async (postId) => {
        try {
            const response = await apiClient.post(`/api/posts/like/${postId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to like post:', error);
            throw error;
        }
    },

    // Comment on a post
    comment: async (postId, text) => {
        try {
            const response = await apiClient.post(`/api/posts/comment/${postId}`, {
                text,
            });
            return response.data;
        } catch (error) {
            console.error('Failed to add comment:', error);
            throw error;
        }
    },
    // Update a post (edit caption)
    update: async (postId, data) => {
        try {
            const response = await apiClient.put(`/api/posts/${postId}`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to update post:', error);
            throw error;
        }
    },

    // Delete a post
    delete: async (postId) => {
        try {
            const response = await apiClient.delete(`/api/posts/${postId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to delete post:', error);
            throw error;
        }
    },
};

/**
 * Users API
 */
export const usersApi = {
    // Get user profile by username
    getProfile: async (username) => {
        try {
            const response = await apiClient.get(`/api/users/profile/${username}`);
            // Backend returns {user, posts}, merge them for easier access
            return {
                ...response.data.user,
                posts: response.data.posts || [],
            };
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            return null;
        }
    },

    // Follow a user
    follow: async (userId) => {
        try {
            const response = await apiClient.post(`/api/users/follow/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to follow user:', error);
            throw error;
        }
    },
};

export const notificationsApi = {
    getAll: async () => {
        try {
            const res = await apiClient.get('/api/notifications');
            return res.data;
        } catch (err) {
            console.error('Failed to fetch notifications', err);
            return [];
        }
    },

    markRead: async (id) => {
        try {
            const res = await apiClient.post(`/api/notifications/${id}/read`);
            return res.data;
        } catch (err) {
            console.error('Failed to mark notification read', err);
            throw err;
        }
    },
};

export default apiClient;
