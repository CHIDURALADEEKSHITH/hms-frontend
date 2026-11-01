import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PasswordInput from "../extras/PasswordInput";
import "./auth.css";

const StaffRegister = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        mobile: "",
        password: "",
        role: "",
        qualification: "",
        specialization: "",
        department: "",
        experience: "",
        medicalRegistrationNumber: ""
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
                experience: formData.experience
                    ? Number(formData.experience)
                    : null
            };

            const response = await api.post("/auth/register", data);

            setMessage(
                "Registration successful. Please wait for Admin approval."
            );

            setFormData({
                fullName: "",
                email: "",
                mobile: "",
                password: "",
                role: "",
                qualification: "",
                specialization: "",
                department: "",
                experience: "",
                medicalRegistrationNumber: ""
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

            <div className="auth-card register-card">

                <h1>Thilak Hospital</h1>

                <h2>Staff Registration</h2>

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
                        <label>Password</label>

                        <PasswordInput strength
                            
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Role</label>

                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select Role
                            </option>

                            <option value="DOCTOR">
                                Doctor
                            </option>

                            <option value="NURSE">
                                Nurse
                            </option>

                            <option value="RECEPTIONIST">
                                Receptionist
                            </option>

                            <option value="PHARMACIST">
                                Pharmacist
                            </option>

                            <option value="LAB_INCHARGE">
                                Lab In-Charge
                            </option>

                            <option value="BED_INCHARGE">
                                Bed In-Charge
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Qualification</label>

                        <input
                            type="text"
                            name="qualification"
                            value={formData.qualification}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Specialization</label>

                        <input
                            type="text"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Department</label>

                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Experience (Years)</label>

                        <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            Medical Registration / License Number
                        </label>

                        <input
                            type="text"
                            name="medicalRegistrationNumber"
                            value={
                                formData.medicalRegistrationNumber
                            }
                            onChange={handleChange}
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

export default StaffRegister;