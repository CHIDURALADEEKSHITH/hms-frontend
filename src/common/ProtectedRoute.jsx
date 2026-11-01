import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

const ProtectedRoute = ({
    children,
    allowedRoles = []
}) => {

    const { user, isLoggedIn } = useAuth();

    if (user === undefined) {
        return <Loading message="Checking authentication..." />;
    }

    if (!isLoggedIn || !user) {
        return <Navigate to="/" replace />;
    }

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
    ) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;