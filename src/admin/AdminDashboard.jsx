import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./admin.css";

const AdminDashboard = () => {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [staffCount, setStaffCount] = useState(0);
    const [patientCount, setPatientCount] = useState(0);
    const [appointmentCount, setAppointmentCount] = useState(0);
    const [revenue, setRevenue] = useState(0);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    // ==========================================
    // LOAD DASHBOARD DATA
    // ==========================================

    const loadDashboardData = async () => {

        try {

            setLoading(true);

            const results = await Promise.allSettled([
                api.get("/admin/staff"),
                api.get("/admin/patients"),
                api.get("/admin/appointments"),
                api.get("/admin/billing")
            ]);

            // ==========================================
            // STAFF
            // ==========================================

            if (results[0].status === "fulfilled") {

                const staff =
                    Array.isArray(results[0].value.data)
                        ? results[0].value.data
                        : [];

                setStaffCount(staff.length);

            } else {

                console.error(
                    "Unable to load staff:",
                    results[0].reason
                );

                setStaffCount(0);
            }


            // ==========================================
            // PATIENTS
            // ==========================================

            if (results[1].status === "fulfilled") {

                const patients =
                    Array.isArray(results[1].value.data)
                        ? results[1].value.data
                        : [];

                setPatientCount(patients.length);

            } else {

                console.error(
                    "Unable to load patients:",
                    results[1].reason
                );

                setPatientCount(0);
            }


            // ==========================================
            // APPOINTMENTS
            // ==========================================

            if (results[2].status === "fulfilled") {

                const appointments =
                    Array.isArray(results[2].value.data)
                        ? results[2].value.data
                        : [];

                const today =
                    new Date().toISOString().split("T")[0];

                const todayAppointments =
                    appointments.filter(
                        (appointment) =>
                            appointment.appointmentDate === today
                    );

                setAppointmentCount(
                    todayAppointments.length
                );

            } else {

                console.error(
                    "Unable to load appointments:",
                    results[2].reason
                );

                setAppointmentCount(0);
            }


            // ==========================================
            // REVENUE
            // ==========================================

            if (results[3].status === "fulfilled") {

                const bills =
                    Array.isArray(results[3].value.data)
                        ? results[3].value.data
                        : [];

                const totalRevenue =
                    bills.reduce(
                        (total, bill) => {

                            const amount =
                                Number(
                                    bill.totalAmount
                                ) || 0;

                            return total + amount;

                        },
                        0
                    );

                setRevenue(totalRevenue);

            } else {

                console.error(
                    "Unable to load billing:",
                    results[3].reason
                );

                setRevenue(0);
            }

        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        logout();
        navigate("/");

    };


    return (

        <div className="admin-layout">

            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <aside className="admin-sidebar">

                <div className="admin-logo">

                    <div className="admin-logo-icon">
                        ✚
                    </div>

                    <div>

                        <h2>
                            Thilak Hospital
                        </h2>

                        <span>
                            Care Portal
                        </span>

                    </div>

                </div>


                <nav className="admin-menu">

                    <button
                        className="admin-menu-item active"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        <span>▣</span>
                        Dashboard
                    </button>


                    <button
                        className="admin-menu-item"
                        onClick={() =>
                            navigate("/admin/staff")
                        }
                    >
                        <span>👥</span>
                        Staff Management
                    </button>


                    <button
                        className="admin-menu-item"
                        onClick={() =>
                            navigate("/admin/patients")
                        }
                    >
                        <span>🧑</span>
                        Patients
                    </button>


                    <button
                        className="admin-menu-item"
                        onClick={() =>
                            navigate("/admin/appointments")
                        }
                    >
                        <span>📅</span>
                        Appointments
                    </button>


                    <button
                        className="admin-menu-item"
                        onClick={() =>
                            navigate("/admin/billing")
                        }
                    >
                        <span>₹</span>
                        Billing
                    </button>


                    <button
                        className="admin-menu-item"
                        onClick={() =>
                            navigate("/admin/overview")
                        }
                    >
                        <span>📊</span>
                        Hospital Overview
                    </button>

                    <button
                        className="admin-menu-item"
                        onClick={() =>
                            navigate("/admin/beds")
                        }
                    >
                        <span>🛏️</span>
                        Beds
                    </button>

                </nav>


                <div className="admin-sidebar-bottom">

                    <button
                        className="admin-menu-item logout-item"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>


            {/* ==========================================
                MAIN
            ========================================== */}

            <main className="admin-main">


                {/* ==========================================
                    HEADER
                ========================================== */}

                <header className="admin-header">

                    <div>

                        <h1>
                            Admin Dashboard
                        </h1>

                        <p>
                            Hospital overview and system management
                        </p>

                    </div>


                    <div className="admin-user">

                        <div className="admin-avatar">

                            {
                                user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "A"
                            }

                        </div>


                        <div>

                            <strong>
                                {
                                    user?.name ||
                                    "Administrator"
                                }
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                    </div>

                </header>


                {/* ==========================================
                    CONTENT
                ========================================== */}

                <div className="admin-content">


                    {/* ==========================================
                        WELCOME
                    ========================================== */}

                    <section className="admin-welcome">

                        <div>

                            <h2>
                                Welcome back,{" "}
                                {
                                    user?.name ||
                                    "Admin"
                                } 👋
                            </h2>

                            <p>
                                Manage hospital staff, patients,
                                appointments and hospital operations.
                            </p>

                        </div>

                    </section>


                    {/* ==========================================
                        STATISTICS
                    ========================================== */}

                    <section className="admin-stats">


                        {/* STAFF */}

                        <div className="admin-stat-card">

                            <div className="stat-icon staff-icon">
                                👥
                            </div>

                            <div>

                                <span>
                                    Total Staff
                                </span>

                                <strong>
                                    {
                                        loading
                                            ? "..."
                                            : staffCount
                                    }
                                </strong>

                                <small>
                                    Registered staff members
                                </small>

                            </div>

                        </div>


                        {/* PATIENTS */}

                        <div className="admin-stat-card">

                            <div className="stat-icon patient-icon">
                                🧑
                            </div>

                            <div>

                                <span>
                                    Total Patients
                                </span>

                                <strong>
                                    {
                                        loading
                                            ? "..."
                                            : patientCount
                                    }
                                </strong>

                                <small>
                                    Registered patients
                                </small>

                            </div>

                        </div>


                        {/* APPOINTMENTS */}

                        <div className="admin-stat-card">

                            <div className="stat-icon appointment-icon">
                                📅
                            </div>

                            <div>

                                <span>
                                    Appointments
                                </span>

                                <strong>
                                    {
                                        loading
                                            ? "..."
                                            : appointmentCount
                                    }
                                </strong>

                                <small>
                                    Today's appointments
                                </small>

                            </div>

                        </div>


                        {/* REVENUE */}

                        <div className="admin-stat-card">

                            <div className="stat-icon revenue-icon">
                                ₹
                            </div>

                            <div>

                                <span>
                                    Revenue
                                </span>

                                <strong>
                                    {
                                        loading
                                            ? "..."
                                            : `₹${revenue.toLocaleString(
                                                "en-IN"
                                            )}`
                                    }
                                </strong>

                                <small>
                                    Hospital revenue
                                </small>

                            </div>

                        </div>

                    </section>


                    {/* ==========================================
                        QUICK ACTIONS
                    ========================================== */}

                    <section className="admin-section">

                        <div className="section-heading">

                            <div>

                                <h2>
                                    Quick Actions
                                </h2>

                                <p>
                                    Frequently used administrative
                                    functions
                                </p>

                            </div>

                        </div>


                        <div className="quick-actions">


                            <button
                                className="quick-action-card"
                                onClick={() =>
                                    navigate("/admin/staff")
                                }
                            >

                                <span>
                                    👥
                                </span>

                                <div>

                                    <strong>
                                        Manage Staff
                                    </strong>

                                    <small>
                                        Approve and manage
                                        hospital staff
                                    </small>

                                </div>

                            </button>


                            <button
                                className="quick-action-card"
                                onClick={() =>
                                    navigate("/admin/patients")
                                }
                            >

                                <span>
                                    🧑
                                </span>

                                <div>

                                    <strong>
                                        View Patients
                                    </strong>

                                    <small>
                                        Monitor registered patients
                                    </small>

                                </div>

                            </button>


                            <button
                                className="quick-action-card"
                                onClick={() =>
                                    navigate("/admin/appointments")
                                }
                            >

                                <span>
                                    📅
                                </span>

                                <div>

                                    <strong>
                                        Appointments
                                    </strong>

                                    <small>
                                        Monitor hospital appointments
                                    </small>

                                </div>

                            </button>


                            <button
                                className="quick-action-card"
                                onClick={() =>
                                    navigate("/admin/overview")
                                }
                            >

                                <span>
                                    📊
                                </span>

                                <div>

                                    <strong>
                                        Hospital Overview
                                    </strong>

                                    <small>
                                        View hospital operations
                                    </small>

                                </div>

                            </button>

                        </div>

                    </section>


                    {/* ==========================================
                        ADMIN RESPONSIBILITIES
                    ========================================== */}

                    <section className="admin-section">

                        <div className="section-heading">

                            <div>

                                <h2>
                                    Administrative Responsibilities
                                </h2>

                                <p>
                                    Main activities handled by
                                    the administrator
                                </p>

                            </div>

                        </div>


                        <div className="responsibility-grid">


                            <div className="responsibility-card">

                                <span>
                                    ✓
                                </span>

                                <div>

                                    <strong>
                                        Staff Approval
                                    </strong>

                                    <p>
                                        Approve or reject staff
                                        registrations.
                                    </p>

                                </div>

                            </div>


                            <div className="responsibility-card">

                                <span>
                                    ✓
                                </span>

                                <div>

                                    <strong>
                                        Staff Monitoring
                                    </strong>

                                    <p>
                                        Activate or deactivate
                                        staff accounts.
                                    </p>

                                </div>

                            </div>


                            <div className="responsibility-card">

                                <span>
                                    ✓
                                </span>

                                <div>

                                    <strong>
                                        Patient Monitoring
                                    </strong>

                                    <p>
                                        Monitor registered hospital
                                        patients.
                                    </p>

                                </div>

                            </div>


                            <div className="responsibility-card">

                                <span>
                                    ✓
                                </span>

                                <div>

                                    <strong>
                                        Hospital Operations
                                    </strong>

                                    <p>
                                        Monitor appointments and
                                        revenue.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </section>

                </div>

            </main>

        </div>

    );
};

export default AdminDashboard;