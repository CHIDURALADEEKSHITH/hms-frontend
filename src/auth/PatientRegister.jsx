import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PasswordInput from "../extras/PasswordInput";
import "./auth.css";

const PatientRegister = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        mobile: "",
        email: "",
        dateOfBirth: "",
        gender: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        try {

            const data = {
                ...formData,
                role: "PATIENT"
            };

            const response = await api.post("/auth/register", data);

            setMessage(
                "Patient registration successful. You can now login."
            );

            setFormData({
                fullName: "",
                mobile: "",
                email: "",
                dateOfBirth: "",
                gender: "",
                password: ""
            });

        } catch (err) {

            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError("Registration failed");
            }
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <h1>Thilak Hospital</h1>

                <h2>Patient Registration</h2>

                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Full Name</label>

                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mobile Number</label>

                        <input
                            type="text"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            maxLength="10"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Date of Birth</label>

                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Gender</label>

                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select Gender
                            </option>

                            <option value="Male">
                                Male
                            </option>

                            <option value="Female">
                                Female
                            </option>

                            <option value="Other">
                                Other
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <PasswordInput strength
                            
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                    >
                        Register
                    </button>

                </form>

                <div className="auth-links">

                    <button
                        onClick={() => navigate("/")}
                    >
                        Back to Login
                    </button>

                </div>

            </div>

        </div>
    );
};

export default PatientRegister;