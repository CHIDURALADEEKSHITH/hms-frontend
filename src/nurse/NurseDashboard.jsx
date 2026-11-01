import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./nurse.css";

const NurseDashboard = () => {
    const navigate = useNavigate();
    const { logout: clearAuthSession } = useAuth();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const nurseId = user.userId;

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const response = await api.get(`/nurse/${nurseId}/patients`);
            setPatients(response.data || []);
        } catch (error) {
            console.error("Unable to load patients", error);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearAuthSession();
        navigate("/", { replace: true });
    };

    const today = new Date().toISOString().split("T")[0];

    const todayPatients = patients.filter((patient) => {
        const date = patient.appointmentDate || patient.date;
        return date && date.startsWith(today);
    });

    return (
        <div className="nurse-page">

            <aside className="nurse-sidebar">
                <div className="nurse-logo">
                    <div className="logo-icon">+</div>
                    <div>
                        <h2>Thilak Hospital</h2>
                        <span>Nurse Portal</span>
                    </div>
                </div>

                <nav className="nurse-nav">
                    <button
                        className="active"
                        onClick={() => navigate("/nurse")}
                    >
                        <span>▣</span>
                        Dashboard
                    </button>

                    <button onClick={() => navigate("/nurse/patients")}>
                        <span>👥</span>
                        Patients
                    </button>

                    <button onClick={() => navigate("/nurse/vitals")}>
                        <span>♥</span>
                        Patient Vitals
                    </button>

                    <button onClick={() => navigate("/nurse/notes")}>
                        <span>📝</span>
                        Nursing Notes
                    </button>
                </nav>

                <button className="nurse-logout" onClick={logout}>
                    ⇥ Logout
                </button>
            </aside>

            <main className="nurse-main">

                <header className="nurse-header">
                    <div>
                        <p className="page-label">NURSE PORTAL</p>
                        <h1>Welcome, {user.name || "Nurse"}</h1>
                        <p>Manage patients, vitals and nursing activities.</p>
                    </div>

                    <div className="nurse-user">
                        <div className="nurse-avatar">
                            {(user.name || "N").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong>{user.name || "Nurse"}</strong>
                            <span>Nurse ID: {nurseId}</span>
                        </div>
                    </div>
                </header>

                <section className="nurse-stats">

                    <div className="nurse-stat-card">
                        <div className="stat-icon blue">👥</div>
                        <div>
                            <span>Total Patients</span>
                            <strong>{patients.length}</strong>
                        </div>
                    </div>

                    <div className="nurse-stat-card">
                        <div className="stat-icon green">♥</div>
                        <div>
                            <span>Today's Patients</span>
                            <strong>{todayPatients.length}</strong>
                        </div>
                    </div>

                    <div className="nurse-stat-card">
                        <div className="stat-icon orange">📝</div>
                        <div>
                            <span>Vitals Pending</span>
                            <strong>
                                {patients.filter((p) => !p.vitalsCompleted).length}
                            </strong>
                        </div>
                    </div>

                </section>

                <section className="nurse-section">

                    <div className="section-heading">
                        <div>
                            <h2>Quick Actions</h2>
                            <p>Common nursing activities</p>
                        </div>
                    </div>

                    <div className="nurse-action-grid">

                        <button
                            className="nurse-action-card"
                            onClick={() => navigate("/nurse/patients")}
                        >
                            <div className="action-icon">👥</div>
                            <h3>View Patients</h3>
                            <p>View assigned and available patient information.</p>
                        </button>

                        <button
                            className="nurse-action-card"
                            onClick={() => navigate("/nurse/vitals")}
                        >
                            <div className="action-icon">♥</div>
                            <h3>Record Vitals</h3>
                            <p>Enter temperature, BP, pulse, SpO₂ and other vitals.</p>
                        </button>

                        <button
                            className="nurse-action-card"
                            onClick={() => navigate("/nurse/notes")}
                        >
                            <div className="action-icon">📝</div>
                            <h3>Nursing Notes</h3>
                            <p>Add observations and nursing care notes.</p>
                        </button>

                    </div>
                </section>

                <section className="nurse-section">

                    <div className="section-heading">
                        <div>
                            <h2>Recent Patients</h2>
                            <p>Patients requiring nursing attention</p>
                        </div>

                        <button
                            className="view-all-btn"
                            onClick={() => navigate("/nurse/patients")}
                        >
                            View All
                        </button>
                    </div>

                    {loading ? (
                        <div className="nurse-empty">
                            Loading patients...
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="nurse-empty">
                            No patients available.
                        </div>
                    ) : (
                        <div className="nurse-table-container">
                            <table className="nurse-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>UHID</th>
                                        <th>Appointment</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {patients.slice(0, 8).map((patient, index) => (
                                        <tr key={patient.id || index}>
                                            <td>
                                                <strong>
                                                    {patient.fullName ||
                                                        patient.patientName ||
                                                        "Patient"}
                                                </strong>
                                            </td>

                                            <td>
                                                {patient.uhid || "-"}
                                            </td>

                                            <td>
                                                {patient.appointmentDate
                                                    ? new Date(
                                                          patient.appointmentDate
                                                      ).toLocaleDateString()
                                                    : "-"}
                                            </td>

                                            <td>
                                                <span className="status-badge">
                                                    {patient.status || "Active"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </section>

            </main>
        </div>
    );
};

export default NurseDashboard;