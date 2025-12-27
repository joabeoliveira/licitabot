import { reactive, readonly } from 'vue';
import axios from 'axios';

const state = reactive({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
});

const setUser = (user) => {
    state.user = user;
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        localStorage.removeItem('user');
    }
};

const setToken = (token) => {
    state.token = token;
    if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    }
};

// Initialize axios auth header if token exists
if (state.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
}

// Add interceptor to handle 401 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            state.user = null;
            state.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const useAuth = () => {
    const login = async (email, password) => {
        state.loading = true;
        state.error = null;
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { user, token } = response.data;
            setUser(user);
            setToken(token);
            return true;
        } catch (error) {
            state.error = error.response?.data?.message || 'Erro ao realizar login';
            return false;
        } finally {
            state.loading = false;
        }
    };

    const register = async (userData) => {
        state.loading = true;
        state.error = null;
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', userData);
            const { user, token } = response.data;
            setUser(user);
            setToken(token);
            return true;
        } catch (error) {
            state.error = error.response?.data?.message || 'Erro ao realizar cadastro';
            return false;
        } finally {
            state.loading = false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    return {
        state: readonly(state),
        login,
        register,
        logout,
        isAuthenticated: () => !!state.token
    };
};
