import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./common.css";

const Navbar = ({ title = "Thilak Hospital" }) => {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {

        // Remove login information
        logout();

        // Go to login page
        navigate("/", { replace: true });
    };

    return (
        <header className="common-navbar">

            <div className="navbar-left">

                <div className="navbar-logo">
                    🏥
                </div>

                <div>
                    <h2>{title}</h2>
                    <span>
                        Care & Cure
                    </span>
                </div>

            </div>

            {user && (

                <div className="navbar-right">

                    <div className="navbar-user">

                        <div className="navbar-avatar">
                            {user.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                        </div>

                        <div className="navbar-user-details">

                            <strong>
                                {user.name}
                            </strong>

                            <span>
                                {user.role}
                            </span>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="navbar-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            )}

        </header>
    );
};

export default Navbar;