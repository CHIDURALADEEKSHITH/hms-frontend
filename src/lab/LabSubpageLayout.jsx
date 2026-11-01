import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./lab.css";

const labNavigation = [
    { label: "Dashboard", icon: "📊", path: "/lab" },
    { label: "Pending Tests", icon: "🧪", path: "/lab/pending" },
    { label: "Process Test", icon: "⚙️", path: "/lab/process" },
    { label: "Test Results", icon: "📋", path: "/lab/results" },
    { label: "Reports", icon: "📄", path: "/lab/reports" }
];

const LabSubpageLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    return (
        <div className="lab-layout">
            <aside className="lab-sidebar">
                <div className="lab-logo">
                    <div className="lab-logo-icon">🏥</div>
                    <div>
                        <h2>Thilak Hospital</h2>
                        <span>Laboratory</span>
                    </div>
                </div>

                <nav className="lab-nav" aria-label="Laboratory navigation">
                    {labNavigation.map((item) => (
                        <button
                            key={item.path}
                            className={`lab-nav-item${location.pathname === item.path ? " active" : ""}`}
                            aria-current={location.pathname === item.path ? "page" : undefined}
                            onClick={() => navigate(item.path)}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>

                <div className="lab-sidebar-bottom">
                    <button
                        className="lab-nav-item logout"
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            <main className="lab-main lab-subpage-main">{children}</main>
        </div>
    );
};

export default LabSubpageLayout;
