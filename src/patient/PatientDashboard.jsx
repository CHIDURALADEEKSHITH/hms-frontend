import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./patient.css";

const PatientDashboard = () => {
    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const patientId = user.userId;

    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [appointmentsRes, prescriptionsRes, labsRes] =
                await Promise.allSettled([
                    api.get(`/patient/${patientId}/appointments`),
                    api.get(`/patient/${patientId}/prescriptions`),
                    api.get(`/patient/${patientId}/lab-reports`)
                ]);

            if (appointmentsRes.status === "fulfilled") {
                setAppointments(appointmentsRes.value.data || []);
            }

            if (prescriptionsRes.status === "fulfilled") {
                setPrescriptions(prescriptionsRes.value.data || []);
            }

            if (labsRes.status === "fulfilled") {
                setLabs(labsRes.value.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearAuth();
        navigate("/");
    };

    const upcomingAppointments = appointments.filter((item) => {
        const status = String(item.status || "").toUpperCase();

        return (
            status !== "CANCELLED" &&
            status !== "COMPLETED"
        );
    });

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

                    <button
                        className="active"
                        onClick={() => navigate("/patient")}
                    >
                        <span>▣</span>
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/profile")
                        }
                    >
                        <span>👤</span>
                        My Profile
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/book-appointment")
                        }
                    >
                        <span>➕</span>
                        Book Appointment
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/appointments")
                        }
                    >
                        <span>📅</span>
                        My Appointments
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/medical-history")
                        }
                    >
                        <span>📋</span>
                        Medical History
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/prescriptions")
                        }
                    >
                        <span>💊</span>
                        Prescriptions
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/lab-reports")
                        }
                    >
                        <span>🧪</span>
                        Lab Reports
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/bills")
                        }
                    >
                        <span>💳</span>
                        Bills
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/admission")
                        }
                    >
                        <span>🏥</span>
                        Admission
                    </button>

                </nav>

                <button
                    className="patient-logout"
                    onClick={logout}
                >
                    ⇥ Logout
                </button>

            </aside>

            <main className="patient-main">

                <header className="patient-header">

                    <div>
                        <p className="patient-label">
                            PATIENT PORTAL
                        </p>

                        <h1>
                            Welcome, {user.name || "Patient"}
                        </h1>

                        <p>
                            Manage your appointments, medical records,
                            prescriptions and hospital services.
                        </p>
                    </div>

                    <div className="patient-user">

                        <div className="patient-avatar">
                            {(user.name || "P")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                {user.name || "Patient"}
                            </strong>

                            <span>
                                UHID: {user.uhid || patientId || "-"}
                            </span>
                        </div>

                    </div>

                </header>

                <section className="patient-stats">

                    <div className="patient-stat-card">
                        <div className="patient-stat-icon blue">
                            📅
                        </div>

                        <div>
                            <span>Appointments</span>
                            <strong>
                                {appointments.length}
                            </strong>
                        </div>
                    </div>

                    <div className="patient-stat-card">
                        <div className="patient-stat-icon green">
                            📆
                        </div>

                        <div>
                            <span>Upcoming</span>
                            <strong>
                                {upcomingAppointments.length}
                            </strong>
                        </div>
                    </div>

                    <div className="patient-stat-card">
                        <div className="patient-stat-icon purple">
                            💊
                        </div>

                        <div>
                            <span>Prescriptions</span>
                            <strong>
                                {prescriptions.length}
                            </strong>
                        </div>
                    </div>

                    <div className="patient-stat-card">
                        <div className="patient-stat-icon orange">
                            🧪
                        </div>

                        <div>
                            <span>Lab Reports</span>
                            <strong>
                                {labs.length}
                            </strong>
                        </div>
                    </div>

                </section>

                <section className="patient-section">

                    <div className="patient-section-heading">

                        <div>
                            <h2>Quick Services</h2>
                            <p>
                                Access your frequently used hospital
                                services.
                            </p>
                        </div>

                    </div>

                    <div className="patient-action-grid">

                        <button
                            className="patient-action-card"
                            onClick={() =>
                                navigate("/patient/book-appointment")
                            }
                        >
                            <div className="patient-action-icon">
                                📅
                            </div>

                            <h3>Book Appointment</h3>

                            <p>
                                Schedule an appointment with a doctor.
                            </p>
                        </button>

                        <button
                            className="patient-action-card"
                            onClick={() =>
                                navigate("/patient/medical-history")
                            }
                        >
                            <div className="patient-action-icon">
                                📋
                            </div>

                            <h3>Medical History</h3>

                            <p>
                                View your consultations and medical
                                records.
                            </p>
                        </button>

                        <button
                            className="patient-action-card"
                            onClick={() =>
                                navigate("/patient/prescriptions")
                            }
                        >
                            <div className="patient-action-icon">
                                💊
                            </div>

                            <h3>Prescriptions</h3>

                            <p>
                                View medicines prescribed by your doctors.
                            </p>
                        </button>

                        <button
                            className="patient-action-card"
                            onClick={() =>
                                navigate("/patient/lab-reports")
                            }
                        >
                            <div className="patient-action-icon">
                                🧪
                            </div>

                            <h3>Lab Reports</h3>

                            <p>
                                View and access your diagnostic reports.
                            </p>
                        </button>

                        <button
                            className="patient-action-card"
                            onClick={() =>
                                navigate("/patient/bills")
                            }
                        >
                            <div className="patient-action-icon">
                                💳
                            </div>

                            <h3>Bills & Payments</h3>

                            <p>
                                View your hospital bills and payment
                                history.
                            </p>
                        </button>

                        <button
                            className="patient-action-card"
                            onClick={() =>
                                navigate("/patient/admission")
                            }
                        >
                            <div className="patient-action-icon">
                                🏥
                            </div>

                            <h3>Admission Details</h3>

                            <p>
                                View your ward, room, bed and admission
                                information.
                            </p>
                        </button>

                    </div>

                </section>

                <section className="patient-section">

                    <div className="patient-section-heading">

                        <div>
                            <h2>Recent Appointments</h2>
                            <p>
                                Your latest appointment information.
                            </p>
                        </div>

                        <button
                            className="patient-view-btn"
                            onClick={() =>
                                navigate("/patient/appointments")
                            }
                        >
                            View All
                        </button>

                    </div>

                    {loading ? (
                        <div className="patient-empty">
                            Loading...
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="patient-empty">
                            No appointments available.
                        </div>
                    ) : (

                        <div className="patient-table-wrapper">

                            <table className="patient-table">

                                <thead>
                                    <tr>
                                        <th>Doctor</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {appointments
                                        .slice(0, 5)
                                        .map((appointment, index) => (

                                            <tr
                                                key={
                                                    appointment.id ||
                                                    index
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        {appointment.doctorName ||
                                                            "Doctor"}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {appointment.appointmentDate
                                                        ? new Date(
                                                              appointment.appointmentDate
                                                          ).toLocaleDateString()
                                                        : "-"}
                                                </td>

                                                <td>
                                                    {appointment.appointmentTime ||
                                                        appointment.time ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    <span className="patient-status">
                                                        {appointment.status ||
                                                            "PENDING"}
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

export default PatientDashboard;