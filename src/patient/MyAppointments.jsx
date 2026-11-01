import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./patient.css";

const MyAppointments = () => {
    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const patientId = user.userId;

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (patientId) {
            loadAppointments();
        } else {
            setError("Patient information not found. Please login again.");
            setLoading(false);
        }
    }, [patientId]);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/patient/${patientId}/appointments`
            );

            setAppointments(response.data || []);

        } catch (err) {
            console.error(
                "Unable to load appointments:",
                err
            );

            setError(
                err.response?.data ||
                "Unable to load appointments."
            );
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearAuth();
        navigate("/");
    };

    return (
        <div className="patient-page">

            {/* SIDEBAR */}
            <aside className="patient-sidebar">

                <div className="patient-logo">

                    <div className="patient-logo-icon">
                        +
                    </div>

                    <div>
                        <h2>Thilak Hospital</h2>
                        <span>Patient Portal</span>
                    </div>

                </div>

                <nav className="patient-nav">

                    <button
                        onClick={() =>
                            navigate("/patient")
                        }
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

                    <button className="active">
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

            {/* MAIN CONTENT */}
            <main className="patient-main">

                <header className="patient-header">

                    <div>

                        <p className="patient-label">
                            APPOINTMENTS
                        </p>

                        <h1>My Appointments</h1>

                        <p>
                            View your scheduled appointments
                            and consultation status.
                        </p>

                    </div>

                </header>

                {/* CONTENT CARD */}
                <section className="patient-form-card">

                    <div className="patient-form-heading">

                        <h2>Appointment History</h2>

                        <p>
                            Your appointment status will be
                            updated after the doctor completes
                            the consultation.
                        </p>

                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="patient-success">
                            Loading appointments...
                        </div>
                    )}

                    {/* ERROR */}
                    {!loading && error && (
                        <div className="patient-error">
                            {error}
                        </div>
                    )}

                    {/* NO APPOINTMENTS */}
                    {!loading &&
                        !error &&
                        appointments.length === 0 && (
                            <div className="patient-success">
                                No appointments found.
                            </div>
                        )}

                    {/* APPOINTMENTS */}
                    {!loading &&
                        !error &&
                        appointments.length > 0 && (

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "16px"
                                }}
                            >

                                {appointments.map(
                                    (appointment) => (

                                        <div
                                            key={
                                                appointment.id ||
                                                appointment.appointmentId
                                            }
                                            style={{
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "14px",
                                                padding: "20px",
                                                background: "#ffffff",
                                                boxShadow:
                                                    "0 4px 12px rgba(0,0,0,0.05)"
                                            }}
                                        >

                                            {/* TOP */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems:
                                                        "center",
                                                    gap: "15px",
                                                    flexWrap:
                                                        "wrap"
                                                }}
                                            >

                                                <div>

                                                    <h3
                                                        style={{
                                                            margin: "0 0 6px"
                                                        }}
                                                    >
                                                        Appointment
                                                    </h3>

                                                    <p
                                                        style={{
                                                            margin: 0,
                                                            color: "#64748b"
                                                        }}
                                                    >
                                                        ID:{" "}
                                                        {
                                                            appointment.appointmentId
                                                        }
                                                    </p>

                                                </div>

                                                {/* STATUS */}
                                                {appointment.verified ? (

                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            padding:
                                                                "8px 14px",
                                                            borderRadius:
                                                                "20px",
                                                            background:
                                                                "#e8f7ee",
                                                            color:
                                                                "#16834b",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        ✓ Completed
                                                    </span>

                                                ) : (

                                                    <span
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            padding:
                                                                "8px 14px",
                                                            borderRadius:
                                                                "20px",
                                                            background:
                                                                "#fff7e6",
                                                            color:
                                                                "#b76e00",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        ⏳ Upcoming
                                                    </span>

                                                )}

                                            </div>

                                            {/* DETAILS */}
                                            <div
                                                style={{
                                                    display:
                                                        "grid",
                                                    gridTemplateColumns:
                                                        "repeat(auto-fit, minmax(180px, 1fr))",
                                                    gap: "18px",
                                                    marginTop:
                                                        "20px",
                                                    paddingTop:
                                                        "18px",
                                                    borderTop:
                                                        "1px solid #f1f5f9"
                                                }}
                                            >

                                                <div>

                                                    <small
                                                        style={{
                                                            color:
                                                                "#64748b"
                                                        }}
                                                    >
                                                        Date
                                                    </small>

                                                    <p
                                                        style={{
                                                            margin:
                                                                "5px 0 0",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        {
                                                            appointment.appointmentDate
                                                        }
                                                    </p>

                                                </div>

                                                <div>

                                                    <small
                                                        style={{
                                                            color:
                                                                "#64748b"
                                                        }}
                                                    >
                                                        Time
                                                    </small>

                                                    <p
                                                        style={{
                                                            margin:
                                                                "5px 0 0",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        {
                                                            appointment.appointmentTime
                                                        }
                                                    </p>

                                                </div>

                                                <div>

                                                    <small
                                                        style={{
                                                            color:
                                                                "#64748b"
                                                        }}
                                                    >
                                                        Doctor
                                                    </small>

                                                    <p
                                                        style={{
                                                            margin:
                                                                "5px 0 0",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        {appointment.doctor
                                                            ?.fullName ||
                                                            appointment.doctor
                                                            ?.name ||
                                                            "Doctor"}
                                                    </p>

                                                </div>

                                                <div>

                                                    <small
                                                        style={{
                                                            color:
                                                                "#64748b"
                                                        }}
                                                    >
                                                        Appointment Status
                                                    </small>

                                                    <p
                                                        style={{
                                                            margin:
                                                                "5px 0 0",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        {appointment.status ||
                                                            "CONFIRMED"}
                                                    </p>

                                                </div>

                                            </div>

                                            {/* REASON */}
                                            <div
                                                style={{
                                                    marginTop:
                                                        "18px"
                                                }}
                                            >

                                                <small
                                                    style={{
                                                        color:
                                                            "#64748b"
                                                    }}
                                                >
                                                    Reason for Visit
                                                </small>

                                                <p
                                                    style={{
                                                        margin:
                                                            "5px 0 0",
                                                        color:
                                                            "#334155"
                                                    }}
                                                >
                                                    {appointment.reason ||
                                                        "Not provided"}
                                                </p>

                                            </div>

                                            {/* COMPLETION MESSAGE */}
                                            {appointment.verified && (

                                                <div
                                                    style={{
                                                        marginTop:
                                                            "18px",
                                                        padding:
                                                            "12px 15px",
                                                        borderRadius:
                                                            "10px",
                                                        background:
                                                            "#f0fdf4",
                                                        color:
                                                            "#166534",
                                                        fontSize:
                                                            "14px"
                                                    }}
                                                >
                                                    ✓ The doctor has
                                                    completed and
                                                    verified this
                                                    appointment.
                                                </div>

                                            )}

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    {/* BOOK NEW APPOINTMENT */}
                    <div
                        style={{
                            marginTop: "25px",
                            paddingTop: "20px",
                            borderTop:
                                "1px solid #e5e7eb"
                        }}
                    >

                        <button
                            className="patient-primary-btn"
                            onClick={() =>
                                navigate(
                                    "/patient/book-appointment"
                                )
                            }
                        >
                            + Book New Appointment
                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
};

export default MyAppointments;