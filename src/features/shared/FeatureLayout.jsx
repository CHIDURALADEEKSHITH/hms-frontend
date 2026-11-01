import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLE_BASE, ROLE_TITLE, hubPath, roleFeatures } from "../registry";
import "./features.css";

/* Shell used by every new feature page: brand bar, tab strip of that role's
   tools, page heading, content.                                              */
const FeatureLayout = ({ title, subtitle, actions, children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const role = user?.role;
    const items = roleFeatures(role);

    useEffect(() => { document.title = `${title} · Thilak Hospital`; }, [title]);

    return (
        <div className="fx-page">
            <header className="fx-top">
                <Link to={ROLE_BASE[role] || "/"} className="fx-brand">
                    <span>✚</span>
                    <div><b>Thilak Hospital</b><small>{ROLE_TITLE[role]}</small></div>
                </Link>

                <nav className="fx-tabs" aria-label="Tools">
                    <Link to={ROLE_BASE[role] || "/"}>← Dashboard</Link>
                    <Link to={hubPath(role)} className={pathname === hubPath(role) ? "on" : ""}>All tools</Link>
                    {items.map((f) => (
                        <Link key={f.path} to={f.path} className={pathname === f.path ? "on" : ""}>
                            <span>{f.icon}</span> {f.label}
                        </Link>
                    ))}
                </nav>

                <div className="fx-user">
                    <i>{(user?.name || "U").charAt(0).toUpperCase()}</i>
                    <span>{user?.name}</span>
                    <button onClick={() => { logout(); navigate("/", { replace: true }); }}>Logout</button>
                </div>
            </header>

            <main className="fx-main">
                <div className="fx-heading">
                    <div>
                        <p>{ROLE_TITLE[role]}</p>
                        <h1>{title}</h1>
                        {subtitle && <span>{subtitle}</span>}
                    </div>
                    {actions && <div className="fx-actions">{actions}</div>}
                </div>
                {children}
            </main>
        </div>
    );
};

export default FeatureLayout;
