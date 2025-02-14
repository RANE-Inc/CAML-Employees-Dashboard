import axios from "axios";

// Create an Axios instance
const api = axios.create({
    baseURL: "http://localhost:4000", 
    withCredentials: true,  // Required for cookies
});

// Function to refresh the token
const refreshAccessToken = async () => {
    try {
        const response = await api.post("/refresh-token");  // Backend refresh route
        return response.data.accessToken;  // Return new token
    } catch (error) {
        console.error("Token refresh failed:", error);
        throw error;
    }
};

// Axios Interceptor: Automatically refresh token on 401 error
api.interceptors.response.use(
    (response) => response,  // If successful, return response
    async (error) => {
        const originalRequest = error.config;

        // If 401 (Unauthorized) and not already retrying, refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await refreshAccessToken();
                
                // Attach new token to the request headers
                api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

                // Retry the original request with the new token
                return api(originalRequest);
            } catch (refreshError) {
                console.error("Session expired. Please log in again.");
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;