import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../common/Navbar";
import Sidebar from "../common/Sidebar";
import Footer from "../common/Footer";
import Loading from "../common/Loading";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import "./receptionist.css";

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const userId = user?.userId;

    // =========================================================
    // LOAD APPOINTMENTS
    // =========================================================

    const loadAppointments = async () => {

        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/receptionist/${userId}/appointments`
            );

            setAppointments(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Unable to load appointments",
                err
            );

            if (err.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (err.response?.status === 403) {

                setError(
                    "You are not authorized to access receptionist appointments."
                );

            } else {

                setError(
                    err.response?.data ||
                    "Unable to load appointments."
                );
            }

            setAppointments([]);

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {

        if (userId) {
            loadAppointments();
        } else {
            setLoading(false);
        }

    }, [userId]);

    // =========================================================
    // NAVIGATION
    // =========================================================

    const goTo = (path) => {
        navigate(path);
    };

    // =========================================================
    // STATISTICS
    // =========================================================

    const totalAppointments = appointments.length;

    const confirmedAppointments = appointments.filter(
        (appointment) =>
            appointment.status?.toUpperCase() === "CONFIRMED"
    ).length;

    const pendingAppointments = appointments.filter(
        (appointment) =>
            appointment.status?.toUpperCase() === "PENDING"
    ).length;

    const completedAppointments = appointments.filter(
        (appointment) =>
            appointment.status?.toUpperCase() === "COMPLETED"
    ).length;

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <Loading message="Loading receptionist dashboard..." />
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="receptionist-layout">

            {/* SIDEBAR */}
            <Sidebar />

            {/* RIGHT SIDE */}
            <div className="receptionist-content">

                {/* NAVBAR */}
                <Navbar title="Receptionist Dashboard" />

                {/* PAGE CONTENT */}
                <main className="receptionist-main">

                    {/* =========================================
                        HEADER
                    ========================================== */}

                    <div className="receptionist-header">

                        <div className="header-text">

                            <span className="welcome-label">
                                RECEPTION DESK
                            </span>

                            <h1>
                                Welcome back, {user?.name || "Receptionist"}
                            </h1>

                            <p>
                                Manage patients, appointments,
                                admissions and hospital billing
                                from one place.
                            </p>

                        </div>

                        <button
                            className="dashboard-refresh-btn"
                            onClick={loadAppointments}
                        >
                            ↻
                            <span>Refresh</span>
                        </button>

                    </div>

                    {/* =========================================
                        ERROR
                    ========================================== */}

                    {error && (
                        <div className="receptionist-error">
                            <span>⚠️</span>
                            <div>
                                <strong>Unable to load data</strong>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* =========================================
                        STATISTICS
                    ========================================== */}

                    <section className="statistics-grid">

                        {/* TOTAL */}
                        <div
                            className="reception-stat-card total"
                            onClick={() =>
                                goTo("/receptionist/appointments")
                            }
                        >

                            <div className="stat-top">
                                <div className="stat-icon">
                                    📅
                                </div>

                                <span className="stat-arrow">
                                    →
                                </span>
                            </div>

                            <div className="stat-number">
                                {totalAppointments}
                            </div>

                            <div className="stat-label">
                                Total Appointments
                            </div>

                        </div>

                        {/* CONFIRMED */}
                        <div
                            className="reception-stat-card confirmed"
                            onClick={() =>
                                goTo("/receptionist/appointments")
                            }
                        >

                            <div className="stat-top">
                                <div className="stat-icon">
                                    ✓
                                </div>

                                <span className="stat-arrow">
                                    →
                                </span>
                            </div>

                            <div className="stat-number">
                                {confirmedAppointments}
                            </div>

                            <div className="stat-label">
                                Confirmed
                            </div>

                        </div>

                        {/* PENDING */}
                        <div
                            className="reception-stat-card pending"
                            onClick={() =>
                                goTo("/receptionist/appointments")
                            }
                        >

                            <div className="stat-top">
                                <div className="stat-icon">
                                    ⏳
                                </div>

                                <span className="stat-arrow">
                                    →
                                </span>
                            </div>

                            <div className="stat-number">
                                {pendingAppointments}
                            </div>

                            <div className="stat-label">
                                Pending
                            </div>

                        </div>

                        {/* COMPLETED */}
                        <div
                            className="reception-stat-card completed"
                            onClick={() =>
                                goTo("/receptionist/appointments")
                            }
                        >

                            <div className="stat-top">
                                <div className="stat-icon">
                                    ✓
                                </div>

                                <span className="stat-arrow">
                                    →
                                </span>
                            </div>

                            <div className="stat-number">
                                {completedAppointments}
                            </div>

                            <div className="stat-label">
                                Completed
                            </div>

                        </div>

                    </section>

                    {/* =========================================
                        QUICK ACTIONS
                    ========================================== */}

                    <section className="reception-section">

                        <div className="section-title-area">

                            <div>
                                <span className="section-small-title">
                                    OPERATIONS
                                </span>

                                <h2>
                                    Quick Actions
                                </h2>

                                <p>
                                    Frequently used reception desk
                                    operations
                                </p>
                            </div>

                        </div>

                        <div className="reception-quick-grid">

                            {/* PATIENT SEARCH */}
                            <button
                                className="reception-action-card"
                                onClick={() =>
                                    goTo(
                                        "/receptionist/patients"
                                    )
                                }
                            >

                                <div className="action-icon patient">
                                    👤
                                </div>

                                <div className="action-content">
                                    <h3>
                                        Patient Search
                                    </h3>

                                    <p>
                                        Find patient records
                                    </p>
                                </div>

                                <span className="action-arrow">
                                    →
                                </span>

                            </button>

                            {/* APPOINTMENTS */}
                            <button
                                className="reception-action-card"
                                onClick={() =>
                                    goTo(
                                        "/receptionist/appointments"
                                    )
                                }
                            >

                                <div className="action-icon appointment">
                                    📅
                                </div>

                                <div className="action-content">
                                    <h3>
                                        Appointments
                                    </h3>

                                    <p>
                                        Manage appointments
                                    </p>
                                </div>

                                <span className="action-arrow">
                                    →
                                </span>

                            </button>

                            {/* WALK-IN */}
                            <button
                                className="reception-action-card"
                                onClick={() =>
                                    goTo(
                                        "/receptionist/walk-in"
                                    )
                                }
                            >

                                <div className="action-icon walkin">
                                    🚶
                                </div>

                                <div className="action-content">
                                    <h3>
                                        Walk-In Patient
                                    </h3>

                                    <p>
                                        Register walk-in patients
                                    </p>
                                </div>

                                <span className="action-arrow">
                                    →
                                </span>

                            </button>

                            {/* ADMISSIONS */}
                            <button
                                className="reception-action-card"
                                onClick={() =>
                                    goTo(
                                        "/receptionist/admissions"
                                    )
                                }
                            >

                                <div className="action-icon admission">
                                    🏥
                                </div>

                                <div className="action-content">
                                    <h3>
                                        Admissions
                                    </h3>

                                    <p>
                                        Manage patient admissions
                                    </p>
                                </div>

                                <span className="action-arrow">
                                    →
                                </span>

                            </button>

                            {/* BILLING */}
                            <button
                                className="reception-action-card"
                                onClick={() =>
                                    goTo(
                                        "/receptionist/billing"
                                    )
                                }
                            >

                                <div className="action-icon billing">
                                    💳
                                </div>

                                <div className="action-content">
                                    <h3>
                                        Hospital Billing
                                    </h3>

                                    <p>
                                        Manage bills and payments
                                    </p>
                                </div>

                                <span className="action-arrow">
                                    →
                                </span>

                            </button>

                        </div>

                    </section>

                    {/* =========================================
                        RECENT APPOINTMENTS
                    ========================================== */}

                    <section className="reception-section">

                        <div className="appointments-header">

                            <div>

                                <span className="section-small-title">
                                    APPOINTMENT MANAGEMENT
                                </span>

                                <h2>
                                    Recent Appointments
                                </h2>

                                <p>
                                    Latest patient appointments
                                </p>

                            </div>

                            <button
                                className="view-all-button"
                                onClick={() =>
                                    goTo(
                                        "/receptionist/appointments"
                                    )
                                }
                            >
                                View All
                                <span>→</span>
                            </button>

                        </div>

                        {/* EMPTY */}
                        {appointments.length === 0 ? (

                            <div className="appointments-empty">

                                <div className="empty-calendar">
                                    📅
                                </div>

                                <h3>
                                    No appointments yet
                                </h3>

                                <p>
                                    New patient appointments
                                    will appear here.
                                </p>

                                <button
                                    onClick={() =>
                                        goTo(
                                            "/receptionist/appointments"
                                        )
                                    }
                                >
                                    Manage Appointments
                                </button>

                            </div>

                        ) : (

                            <div className="appointments-table-wrapper">

                                <table className="reception-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                APPOINTMENT
                                            </th>

                                            <th>
                                                PATIENT
                                            </th>

                                            <th>
                                                DOCTOR
                                            </th>

                                            <th>
                                                DATE
                                            </th>

                                            <th>
                                                TIME
                                            </th>

                                            <th>
                                                STATUS
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {appointments
                                            .slice(0, 5)
                                            .map(
                                                (
                                                    appointment
                                                ) => {

                                                    const status =
                                                        appointment.status
                                                            ?.toLowerCase()
                                                            ?.replace(
                                                                /\s+/g,
                                                                "-"
                                                            ) ||
                                                        "unknown";

                                                    return (

                                                        <tr
                                                            key={
                                                                appointment.id ||
                                                                appointment.appointmentId
                                                            }
                                                        >

                                                            <td>

                                                                <div className="appointment-id">

                                                                    <span className="appointment-dot">
                                                                        #
                                                                    </span>

                                                                    {appointment.appointmentId ||
                                                                        appointment.id ||
                                                                        "-"}

                                                                </div>

                                                            </td>

                                                            <td>

                                                                <div className="patient-cell">

                                                                    <div className="patient-avatar">
                                                                        {(appointment.patient?.fullName ||
                                                                            appointment.patient?.name ||
                                                                            "P")
                                                                            .charAt(0)
                                                                            .toUpperCase()}
                                                                    </div>

                                                                    <span>
                                                                        {appointment.patient?.fullName ||
                                                                            appointment.patient?.name ||
                                                                            "Unknown Patient"}
                                                                    </span>

                                                                </div>

                                                            </td>

                                                            <td>
                                                                {appointment.doctor?.fullName ||
                                                                    appointment.doctor?.name ||
                                                                    "Unknown Doctor"}
                                                            </td>

                                                            <td>
                                                                {appointment.appointmentDate ||
                                                                    "-"}
                                                            </td>

                                                            <td>
                                                                {appointment.appointmentTime ||
                                                                    "-"}
                                                            </td>

                                                            <td>

                                                                <span
                                                                    className={`appointment-status ${status}`}
                                                                >
                                                                    <span className="status-dot">
                                                                        ●
                                                                    </span>

                                                                    {appointment.status ||
                                                                        "UNKNOWN"}

                                                                </span>

                                                            </td>

                                                        </tr>

                                                    );
                                                }
                                            )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>

                </main>

                <Footer />

            </div>

        </div>
    );
};

export default ReceptionistDashboard;