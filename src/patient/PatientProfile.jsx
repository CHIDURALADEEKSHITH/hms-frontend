
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { formatDate } from "../utils/formatters";
import "./patient.css";

const emptyForm = {
    fullName: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
};

const PatientProfile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.userId) {
                setError("Patient information is not available.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/patient/${user.userId}`);
                setPatient(response.data);
                setError("");
            } catch (err) {
                const data = err.response?.data;
                setError(
                    typeof data === "string"
                        ? data
                        : data?.message || "Unable to load your profile."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user?.userId]);

    const startEditing = () => {
        setForm({
            ...emptyForm,
            fullName: patient?.fullName || "",
            email: patient?.email || "",
        });
        setError("");
        setSuccess("");
        setEditing(true);
    };

    const handleChange = (e) => {
        setForm((previous) => ({
            ...previous,
            [e.target.name]: e.target.value,
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.fullName.trim()) {
            setError("Full name is required.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            setError("Enter a valid email address.");
            return;
        }

        const changingPassword =
            form.oldPassword !== "" ||
            form.newPassword !== "" ||
            form.confirmNewPassword !== "";

        if (changingPassword) {
            if (
                !form.oldPassword ||
                !form.newPassword ||
                !form.confirmNewPassword
            ) {
                setError("Fill in all three password fields.");
                return;
            }

            if (form.newPassword.length < 8) {
                setError("New password must contain at least 8 characters.");
                return;
            }

            if (form.newPassword === form.oldPassword) {
                setError("New password must differ from the old password.");
                return;
            }

            if (form.newPassword !== form.confirmNewPassword) {
                setError("New password and confirmation do not match.");
                return;
            }
        }

        try {
            setSaving(true);

            const response = await api.put("/auth/patient/profile", {
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                oldPassword: form.oldPassword,
                newPassword: form.newPassword,
                confirmNewPassword: form.confirmNewPassword,
            });

            setPatient((previous) => ({
                ...previous,
                ...response.data,
                id: response.data.userId ?? previous?.id,
            }));

            setEditing(false);
            setForm(emptyForm);
            setSuccess("Profile updated successfully.");

            if (
                response.data.email &&
                response.data.email !== user?.email
            ) {
                setSuccess(
                    "Email updated. Please log in again using your new email address."
                );
            }
        } catch (err) {
            const data = err.response?.data;
            setError(
                typeof data === "string"
                    ? data
                    : data?.message || "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="patient-page">
            <aside className="patient-sidebar">
                <div className="patient-logo">
                    <div className="patient-logo-icon">+</div>
                    <div>
                        <h2>Thilak Hospital</h2>
                        <span>Patient Portal</span>
                    </div>
                </div>

                <nav className="patient-nav">
                    <button onClick={() => navigate("/patient")}>
                        <span>▣</span> Dashboard
                    </button>
                    <button
                        className="active"
                        onClick={() => navigate("/patient/profile")}
                    >
                        <span>👤</span> My Profile
                    </button>
                    <button onClick={() => navigate("/patient/book-appointment")}>
                        <span>➕</span> Book Appointment
                    </button>
                    <button onClick={() => navigate("/patient/appointments")}>
                        <span>📅</span> My Appointments
                    </button>
                    <button onClick={() => navigate("/patient/history")}>
                        <span>📋</span> Medical History
                    </button>
                    <button onClick={() => navigate("/patient/prescriptions")}>
                        <span>💊</span> Prescriptions
                    </button>
                    <button onClick={() => navigate("/patient/lab-reports")}>
                        <span>🧪</span> Lab Reports
                    </button>
                    <button onClick={() => navigate("/patient/bills")}>
                        <span>💳</span> Bills
                    </button>
                    <button onClick={() => navigate("/patient/admission")}>
                        <span>🏥</span> Admission
                    </button>
                </nav>

                <button className="patient-logout" onClick={handleLogout}>
                    ⇥ Logout
                </button>
            </aside>

            <main className="patient-main">
                <header className="patient-header">
                    <div>
                        <p className="patient-label">PATIENT PORTAL</p>
                        <h1>My Profile</h1>
                        <p>View and manage your personal information.</p>
                    </div>

                    <button
                        className="patient-view-btn"
                        onClick={() => navigate("/patient")}
                    >
                        ← Dashboard
                    </button>
                </header>

                {loading ? (
                    <section className="patient-section">
                        <div className="patient-empty">Loading profile...</div>
                    </section>
                ) : error && !patient ? (
                    <section className="patient-section">
                        <div className="patient-error">{error}</div>
                    </section>
                ) : (
                    <section className="patient-section">
                        {error && (
                            <div className="patient-error" role="alert">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="patient-success" role="status">
                                {success}
                            </div>
                        )}

                        <div className="patient-profile-card">
                            <div className="patient-profile-top">
                                <div className="patient-large-avatar">
                                    {(patient?.fullName || "P")
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <h2>{patient?.fullName || "Patient"}</h2>
                                    <p>UHID: {patient?.uhid || "-"}</p>
                                </div>

                                {!editing && (
                                    <button
                                        type="button"
                                        className="patient-view-btn"
                                        onClick={startEditing}
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {!editing ? (
                                <div className="patient-details-grid">
                                    <div>
                                        <label>Patient ID</label>
                                        <strong>{patient?.id || user?.userId || "-"}</strong>
                                    </div>
                                    <div>
                                        <label>UHID</label>
                                        <strong>{patient?.uhid || "-"}</strong>
                                    </div>
                                    <div>
                                        <label>Full Name</label>
                                        <strong>{patient?.fullName || "-"}</strong>
                                    </div>
                                    <div>
                                        <label>Mobile</label>
                                        <strong>{patient?.mobile || "-"}</strong>
                                    </div>
                                    <div>
                                        <label>Email</label>
                                        <strong>{patient?.email || "-"}</strong>
                                    </div>
                                    <div>
                                        <label>Gender</label>
                                        <strong>{patient?.gender || "-"}</strong>
                                    </div>
                                    <div>
                                        <label>Date of Birth</label>
                                        <strong>
                                            {patient?.dateOfBirth
                                                ? formatDate(patient.dateOfBirth)
                                                : "-"}
                                        </strong>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdate}>
                                    <h3>Edit Profile</h3>

                                    <div className="patient-profile-field">
                                        <label htmlFor="fullName">Full Name</label>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="patient-profile-field">
                                        <label htmlFor="email">Email Address</label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <hr />

                                    <h3>Change Password</h3>
                                    <p>
                                        Leave all password fields empty if you
                                        don't want to change your password.
                                    </p>

                                    <div className="patient-details-grid">
                                        <div>
                                            <label htmlFor="oldPassword">
                                                Old Password
                                            </label>
                                            <input
                                                id="oldPassword"
                                                name="oldPassword"
                                                type="password"
                                                value={form.oldPassword}
                                                onChange={handleChange}
                                                autoComplete="current-password"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="newPassword">
                                                New Password
                                            </label>
                                            <input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                value={form.newPassword}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="confirmNewPassword">
                                                Confirm New Password
                                            </label>
                                            <input
                                                id="confirmNewPassword"
                                                name="confirmNewPassword"
                                                type="password"
                                                value={form.confirmNewPassword}
                                                onChange={handleChange}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>

                                    <div className="patient-profile-actions">
                                        <button
                                            type="submit"
                                            className="patient-view-btn"
                                            disabled={saving}
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>

                                        <button
                                            type="button"
                                            className="patient-view-btn"
                                            disabled={saving}
                                            onClick={() => {
                                                setEditing(false);
                                                setError("");
                                                setForm(emptyForm);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default PatientProfile;
