export const getToken = () => {
    return localStorage.getItem("token");
};

export const getUser = () => {

    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        console.error("Invalid user data");
        return null;
    }
};

export const isAuthenticated = () => {
    return !!getToken() && !!getUser();
};

export const getRole = () => {
    const user = getUser();
    return user?.role || null;
};

export const getUserId = () => {
    const user = getUser();
    return user?.userId || null;
};

export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export const hasRole = (role) => {
    return getRole() === role;
};

export const hasAnyRole = (roles = []) => {
    return roles.includes(getRole());
};