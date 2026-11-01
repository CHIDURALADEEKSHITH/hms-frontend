
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../extras/PasswordInput";
import "./auth.css";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [loginValue, setLoginValue] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!loginValue || !password) {
            setError("Please enter email/mobile and password");
            return;
        }

        try {
            setLoading(true);

            const data = loginValue.includes("@")
                ? { email: loginValue, password }
                : { mobile: loginValue, password };

            const response = await api.post("/auth/login", data);

            login(response.data);

            const role = response.data.role;

            switch (role) {
                case "ADMIN":
                    navigate("/admin");
                    break;
                case "DOCTOR":
                    navigate("/doctor");
                    break;
                case "NURSE":
                    navigate("/nurse");
                    break;
                case "RECEPTIONIST":
                    navigate("/receptionist");
                    break;
                case "PATIENT":
                    navigate("/patient");
                    break;
                case "PHARMACIST":
                    navigate("/pharmacist");
                    break;
                case "LAB_INCHARGE":
                    navigate("/lab");
                    break;
                case "BED_INCHARGE":
                    navigate("/bed");
                    break;
                default:
                    setError("Unknown user role");
            }
        } catch (err) {
            if (err.response?.data) {
                const data = err.response.data;
                setError(
                    typeof data === "string"
                        ? data
                        : data.message || "Login failed"
                );
            } else {
                setError("Unable to connect to server");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page auth-split">

            <section className="auth-hero">
                <div className="auth-hero-brand">
                    <div className="navbar-logo">T</div>
                    <div>
                        <strong>Thilak Hospital</strong>
                        <small>Care Portal</small>
                    </div>
                </div>

                <div className="auth-hero-copy">
                    <h2>
                        Care that<br />
                        <em>knows you</em> by name.
                    </h2>
                    <p>
                        One secure workspace for doctors, nurses, pharmacy,
                        laboratory, wards and patients at Thilak Hospital.
                    </p>
                </div>

                <div className="auth-hero-facts">
                    <div><b>8</b><span>Care teams</span></div>
                    <div><b>24/7</b><span>Emergency</span></div>
                    <div><b>1</b><span>Patient record</span></div>
                </div>
            </section>

            <div className="auth-panel">
            <div className="auth-card">
                <h1>Welcome back</h1>
                <h2>Sign in to Thilak Hospital</h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email or Mobile Number</label>
                        <input
                            type="text"
                            placeholder="Enter email or mobile number"
                            value={loginValue}
                            onChange={(e) =>
                                setLoginValue(e.target.value)
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <PasswordInput
                            
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />
                    </div>

                    <div style={{
                        textAlign: "right",
                        marginBottom: "15px"
                    }}>
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#8c1d40",
                                cursor: "pointer",
                                padding: 0,
                                fontSize: "14px"
                            }}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="auth-links">
                    <button
                        type="button"
                        onClick={() => navigate("/staff-register")}
                    >
                        Staff Registration
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/patient-register")}
                    >
                        Patient Registration
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Login;
