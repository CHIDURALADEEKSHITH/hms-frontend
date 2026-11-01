import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./doctor.css";

const DoctorDashboard = () => {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedAppointment, setSelectedAppointment] =
        useState(null);

    const [vitals, setVitals] = useState([]);
    const [vitalsLoading, setVitalsLoading] = useState(false);
    const [vitalsError, setVitalsError] = useState("");

    // =========================================================
    // VERIFICATION
    // =========================================================

    const [verifiedAppointments, setVerifiedAppointments] =
        useState([]);

    // =========================================================
    // LOAD DOCTOR APPOINTMENTS
    // =========================================================

    useEffect(() => {

        if (user?.userId) {
            loadAppointments();
        }

    }, [user?.userId]);


    const loadAppointments = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                `/doctor/${user.userId}/appointments`
            );

            console.log(
                "DOCTOR APPOINTMENTS RESPONSE:",
                response.data
            );

            setAppointments(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Doctor dashboard error:",
                error
            );

            setAppointments([]);

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // GET PATIENT ID
    // =========================================================

    const getPatientId = (appointment) => {

        const patientId =
            appointment?.patient?.id ??
            appointment?.patientId ??
            appointment?.patient?.userId ??
            null;

        return patientId;
    };


    // =========================================================
    // GET PATIENT NAME
    // =========================================================

    const getPatientName = (appointment) => {

        return (
            appointment?.patient?.fullName ||
            appointment?.patientName ||
            "Patient"
        );

    };


    // =========================================================
    // GET APPOINTMENT ID
    // =========================================================

    const getAppointmentId = (appointment) => {

        return (
            appointment?.appointmentId ||
            appointment?.id ||
            "-"
        );

    };


    // =========================================================
    // VIEW PATIENT
    // =========================================================

    const handleViewPatient = (appointment) => {

        console.log(
            "================================="
        );

        console.log(
            "FULL APPOINTMENT:",
            appointment
        );

        console.log(
            "PATIENT OBJECT:",
            appointment?.patient
        );

        const patientId =
            getPatientId(appointment);

        console.log(
            "PATIENT ID:",
            patientId
        );

        console.log(
            "================================="
        );


        if (
            patientId === null ||
            patientId === undefined
        ) {

            alert(
                "Patient ID is not available in this appointment."
            );

            return;
        }


        navigate(
            `/doctor/patient/${patientId}/${appointment.id}`,
            {
                state: {
                    patient:
                        appointment?.patient ||
                        null,
                    appointment
                }
            }
        );
    };


    // =========================================================
    // LOAD PATIENT VITALS
    // =========================================================

    const loadPatientVitals = async (appointment) => {

        setSelectedAppointment(appointment);
        setVitals([]);
        setVitalsError("");

        const appointmentId = appointment?.id;

        console.log(
            "Loading vitals for appointment:",
            appointmentId
        );

        if (
            appointmentId === null ||
            appointmentId === undefined
        ) {
            setVitalsError(
                "Appointment ID is not available."
            );
            return;
        }

        try {
            setVitalsLoading(true);

            const response = await api.get(
                `/doctor/appointment/${appointmentId}/vitals`
            );

            console.log(
                "APPOINTMENT VITALS RESPONSE:",
                response.data
            );

            setVitals(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(
                "Unable to load appointment vitals:",
                error
            );

            setVitalsError(
                error.response?.data ||
                "Unable to load appointment vitals."
            );
        } finally {
            setVitalsLoading(false);
        }
    };


    // =========================================================
    // CLOSE VITALS
    // =========================================================

    const closeVitals = () => {

        setSelectedAppointment(null);
        setVitals([]);
        setVitalsError("");

    };


    // =========================================================
    // VERIFY APPOINTMENT / PATIENT DETAILS
    // =========================================================

    const handleVerify = async (appointment) => {

        const appointmentId = appointment?.id;

        if (!appointmentId) {
            alert("Appointment ID is not available.");
            return;
        }

        try {

            await api.put(
                `/doctor/appointment/${appointmentId}/verify`
            );

            setVerifiedAppointments((previous) => {

                if (previous.includes(appointmentId)) {
                    return previous;
                }

                return [
                    ...previous,
                    appointmentId
                ];

            });

            setAppointments((previous) =>
                previous.map((item) =>
                    item.id === appointmentId
                        ? {
                            ...item,
                            verified: true
                        }
                        : item
                )
            );

        } catch (error) {

            console.error(
                "Verification failed:",
                error
            );

            alert(
                error.response?.data ||
                "Unable to verify appointment."
            );
        }
    };


    // =========================================================
    // CHECK WHETHER APPOINTMENT IS VERIFIED
    // =========================================================

    const isVerified = (appointment) => {

        const appointmentKey =
            appointment?.id ??
            appointment?.appointmentId;

        return Boolean(appointment?.verified) ||
            verifiedAppointments.includes(appointmentKey);

    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        logout();
        navigate("/");

    };


    // =========================================================
    // FORMAT VITAL VALUE
    // =========================================================

    const getVitalValue = (vital, ...names) => {

        for (const name of names) {

            if (
                vital?.[name] !== undefined &&
                vital?.[name] !== null &&
                vital?.[name] !== ""
            ) {

                return vital[name];

            }

        }

        return "-";

    };


    const todayAppointments =
        appointments.length;


    return (

        <div className="doctor-layout">

            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside className="doctor-sidebar">

                <div className="doctor-logo">

                    <div className="doctor-logo-icon">
                        ✚
                    </div>

                    <div>
                        <h2>Thilak Hospital</h2>

                        <span>
                            Doctor Portal
                        </span>
                    </div>

                </div>


                <nav className="doctor-menu">

                    <button
                        className="doctor-menu-item active"
                        onClick={() =>
                            navigate("/doctor")
                        }
                    >
                        <span>▣</span>
                        Dashboard
                    </button>


                    <button
                        className="doctor-menu-item"
                        onClick={() =>
                            navigate("/doctor/profile")
                        }
                    >
                        <span>👨‍⚕️</span>
                        My Profile
                    </button>


                    <button
                        className="doctor-menu-item"
                        onClick={() =>
                            navigate("/doctor/availability")
                        }
                    >
                        <span>🕐</span>
                        Availability
                    </button>


                    <button
                        className="doctor-menu-item"
                        onClick={() =>
                            navigate("/doctor/appointments")
                        }
                    >
                        <span>📅</span>
                        Appointments
                    </button>


                    <button
                        className="doctor-menu-item"
                        onClick={() =>
                            navigate("/doctor/appointments")
                        }
                    >
                        <span>🧑</span>
                        Patients
                    </button>


                    <button
                        className="doctor-menu-item"
                        onClick={() =>
                            navigate("/doctor/prescriptions")
                        }
                    >
                        <span>💊</span>
                        Prescriptions
                    </button>


                    <button
                        className="doctor-menu-item"
                        onClick={() =>
                            navigate("/doctor/lab-orders")
                        }
                    >
                        <span>🔬</span>
                        Lab Orders
                    </button>


                    <button
                        className="doctor-menu-item"
                        onClick={() =>
                            navigate("/doctor/discharge")
                        }
                    >
                        <span>📄</span>
                        Discharge Summary
                    </button>

                </nav>


                <div className="doctor-sidebar-bottom">

                    <button
                        className="doctor-menu-item logout-item"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="doctor-main">

                <header className="doctor-header">

                    <div>

                        <h1>
                            Doctor Dashboard
                        </h1>

                        <p>
                            Manage consultations and patient care
                        </p>

                    </div>


                    <div className="doctor-user">

                        <div className="doctor-avatar">

                            {
                                user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                "D"
                            }

                        </div>


                        <div>

                            <strong>
                                Dr. {user?.name || "Doctor"}
                            </strong>

                            <span>
                                Doctor
                            </span>

                        </div>

                    </div>

                </header>


                <div className="doctor-content">

                    {/* =================================================
                        WELCOME
                    ================================================= */}

                    <section className="doctor-welcome">

                        <div>

                            <h2>
                                Welcome, Dr.{" "}
                                {user?.name || "Doctor"} 👋
                            </h2>

                            <p>
                                Manage your appointments,
                                consultations, prescriptions
                                and patient care.
                            </p>

                        </div>

                    </section>


                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <section className="doctor-stats">

                        <div className="doctor-stat-card">

                            <div className="doctor-stat-icon blue">
                                📅
                            </div>

                            <div>

                                <span>
                                    Appointments
                                </span>

                                <strong>
                                    {loading
                                        ? "..."
                                        : todayAppointments}
                                </strong>

                                <small>
                                    Current appointments
                                </small>

                            </div>

                        </div>


                        <div className="doctor-stat-card">

                            <div className="doctor-stat-icon green">
                                🧑
                            </div>

                            <div>

                                <span>
                                    Patients
                                </span>

                                <strong>
                                    {appointments.length}
                                </strong>

                                <small>
                                    Patients in appointments
                                </small>

                            </div>

                        </div>


                        <div className="doctor-stat-card">

                            <div className="doctor-stat-icon orange">
                                🔬
                            </div>

                            <div>

                                <span>
                                    Lab Orders
                                </span>

                                <strong>
                                    0
                                </strong>

                                <small>
                                    Pending laboratory orders
                                </small>

                            </div>

                        </div>


                        <div className="doctor-stat-card">

                            <div className="doctor-stat-icon purple">
                                💊
                            </div>

                            <div>

                                <span>
                                    Prescriptions
                                </span>

                                <strong>
                                    0
                                </strong>

                                <small>
                                    Recent prescriptions
                                </small>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        APPOINTMENTS
                    ================================================= */}

                    <section className="doctor-section">

                        <div className="doctor-section-heading">

                            <div>

                                <h2>
                                    Appointments
                                </h2>

                                <p>
                                    Your scheduled patient appointments
                                </p>

                            </div>


                            <button
                                className="doctor-outline-button"
                                onClick={() =>
                                    navigate(
                                        "/doctor/appointments"
                                    )
                                }
                            >
                                View All
                            </button>

                        </div>


                        <div className="doctor-table-card">

                            {loading ? (

                                <div className="doctor-loading">
                                    Loading appointments...
                                </div>

                            ) : appointments.length === 0 ? (

                                <div className="doctor-empty">

                                    <div>
                                        📅
                                    </div>

                                    <h3>
                                        No Appointments
                                    </h3>

                                    <p>
                                        You currently have no
                                        appointments.
                                    </p>

                                </div>

                            ) : (

                                <div className="doctor-table-wrapper">

                                    <table className="doctor-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    ID
                                                </th>

                                                <th>
                                                    Patient
                                                </th>

                                                <th>
                                                    Date
                                                </th>

                                                <th>
                                                    Time
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Actions
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {appointments
                                                .slice(0, 5)
                                                .map(
                                                    (
                                                        appointment,
                                                        index
                                                    ) => {

                                                        const patientId =
                                                            getPatientId(
                                                                appointment
                                                            );

                                                        const verified =
                                                            isVerified(
                                                                appointment
                                                            );


                                                        return (

                                                            <tr
                                                                key={
                                                                    appointment.id ||
                                                                    appointment.appointmentId ||
                                                                    index
                                                                }
                                                            >

                                                                <td>

                                                                    <strong>
                                                                        {
                                                                            getAppointmentId(
                                                                                appointment
                                                                            )
                                                                        }
                                                                    </strong>

                                                                </td>


                                                                <td>

                                                                    <strong>
                                                                        {
                                                                            getPatientName(
                                                                                appointment
                                                                            )
                                                                        }
                                                                    </strong>


                                                                    <small
                                                                        style={{
                                                                            display:
                                                                                "block",
                                                                            marginTop:
                                                                                "4px",
                                                                            color:
                                                                                "#7b8a9a"
                                                                        }}
                                                                    >
                                                                        Patient ID:{" "}
                                                                        {
                                                                            patientId ||
                                                                            "Not available"
                                                                        }
                                                                    </small>

                                                                </td>


                                                                <td>
                                                                    {
                                                                        appointment.appointmentDate ||
                                                                        appointment.date ||
                                                                        "-"
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        appointment.appointmentTime ||
                                                                        appointment.time ||
                                                                        "-"
                                                                    }
                                                                </td>


                                                                <td>

                                                                    <span className="doctor-status">
                                                                        {
                                                                            appointment.status ||
                                                                            "SCHEDULED"
                                                                        }
                                                                    </span>

                                                                </td>


                                                                {/* =================================================
                                                                    ACTIONS
                                                                ================================================= */}

                                                                <td>

                                                                    <button
                                                                        className="doctor-outline-button"
                                                                        onClick={() =>
                                                                            handleViewPatient(
                                                                                appointment
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !patientId
                                                                        }
                                                                    >
                                                                        View Patient
                                                                    </button>


                                                                    <button
                                                                        className="doctor-outline-button"
                                                                        onClick={() =>
                                                                            loadPatientVitals(
                                                                                appointment
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !patientId
                                                                        }
                                                                        style={{
                                                                            marginLeft:
                                                                                "8px"
                                                                        }}
                                                                    >
                                                                        View Vitals
                                                                    </button>


                                                                    {/* =================================================
                                                                        VERIFY BUTTON
                                                                    ================================================= */}

                                                                    <button
                                                                        className="doctor-outline-button"
                                                                        onClick={() =>
                                                                            handleVerify(
                                                                                appointment
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !patientId ||
                                                                            verified
                                                                        }
                                                                        style={{
                                                                            marginLeft:
                                                                                "8px",
                                                                            backgroundColor:
                                                                                verified
                                                                                    ? "#e8f7ee"
                                                                                    : "",
                                                                            color:
                                                                                verified
                                                                                    ? "#16834b"
                                                                                    : "",
                                                                            borderColor:
                                                                                verified
                                                                                    ? "#8ed3aa"
                                                                                    : ""
                                                                        }}
                                                                    >
                                                                        {verified
                                                                            ? "✓ Verified"
                                                                            : "✓ Verify"}
                                                                    </button>

                                                                </td>

                                                            </tr>

                                                        );

                                                    }
                                                )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </section>


                    {/* =================================================
                        PATIENT VITALS
                    ================================================= */}

                    {selectedAppointment && (

                        <section className="doctor-section">

                            <div className="doctor-section-heading">

                                <div>

                                    <h2>
                                        Patient Vitals
                                    </h2>

                                    <p>
                                        Vitals recorded by the nurse
                                    </p>

                                </div>


                                <button
                                    className="doctor-outline-button"
                                    onClick={closeVitals}
                                >
                                    Close
                                </button>

                            </div>


                            <div
                                className="doctor-table-card"
                                style={{
                                    padding: "24px",
                                    marginBottom: "20px"
                                }}
                            >

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(3, 1fr)",
                                        gap: "20px"
                                    }}
                                >

                                    <div>

                                        <small>
                                            Patient
                                        </small>

                                        <h3>
                                            {
                                                getPatientName(
                                                    selectedAppointment
                                                )
                                            }
                                        </h3>

                                    </div>


                                    <div>

                                        <small>
                                            Appointment ID
                                        </small>

                                        <h3>
                                            {
                                                getAppointmentId(
                                                    selectedAppointment
                                                )
                                            }
                                        </h3>

                                    </div>


                                    <div>

                                        <small>
                                            Patient ID
                                        </small>

                                        <h3>
                                            {
                                                getPatientId(
                                                    selectedAppointment
                                                ) ||
                                                "-"
                                            }
                                        </h3>

                                    </div>

                                </div>

                            </div>


                            {vitalsLoading ? (

                                <div className="doctor-table-card">

                                    <div className="doctor-loading">
                                        Loading patient vitals...
                                    </div>

                                </div>

                            ) : vitalsError ? (

                                <div className="doctor-table-card">

                                    <div className="doctor-empty">

                                        <div>
                                            ⚠️
                                        </div>

                                        <h3>
                                            Unable to Load Vitals
                                        </h3>

                                        <p>
                                            {vitalsError}
                                        </p>

                                    </div>

                                </div>

                            ) : vitals.length === 0 ? (

                                <div className="doctor-table-card">

                                    <div className="doctor-empty">

                                        <div>
                                            🩺
                                        </div>

                                        <h3>
                                            No Vitals Recorded
                                        </h3>

                                        <p>
                                            The nurse has not recorded
                                            vitals for this patient yet.
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <div className="doctor-table-card">

                                    <div
                                        style={{
                                            padding: "24px"
                                        }}
                                    >

                                        {(() => {

                                            const vital =
                                                vitals[
                                                    vitals.length - 1
                                                ];

                                            return (

                                                <>

                                                    <div
                                                        style={{
                                                            display:
                                                                "grid",
                                                            gridTemplateColumns:
                                                                "repeat(4, 1fr)",
                                                            gap: "16px"
                                                        }}
                                                    >

                                                        <div className="doctor-stat-card">

                                                            <div className="doctor-stat-icon orange">
                                                                🌡️
                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Temperature
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        getVitalValue(
                                                                            vital,
                                                                            "temperature",
                                                                            "temp"
                                                                        )
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    °F
                                                                </small>

                                                            </div>

                                                        </div>


                                                        <div className="doctor-stat-card">

                                                            <div className="doctor-stat-icon blue">
                                                                ❤️
                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Blood Pressure
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        getVitalValue(
                                                                            vital,
                                                                            "bloodPressure",
                                                                            "bp"
                                                                        )
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    mmHg
                                                                </small>

                                                            </div>

                                                        </div>


                                                        <div className="doctor-stat-card">

                                                            <div className="doctor-stat-icon green">
                                                                💓
                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Pulse
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        getVitalValue(
                                                                            vital,
                                                                            "pulse",
                                                                            "heartRate"
                                                                        )
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    bpm
                                                                </small>

                                                            </div>

                                                        </div>


                                                        <div className="doctor-stat-card">

                                                            <div className="doctor-stat-icon purple">
                                                                🫁
                                                            </div>

                                                            <div>

                                                                <span>
                                                                    SpO₂
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        getVitalValue(
                                                                            vital,
                                                                            "spo2",
                                                                            "spO2",
                                                                            "oxygenSaturation"
                                                                        )
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    %
                                                                </small>

                                                            </div>

                                                        </div>


                                                        <div className="doctor-stat-card">

                                                            <div className="doctor-stat-icon blue">
                                                                ⚖️
                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Weight
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        getVitalValue(
                                                                            vital,
                                                                            "weight"
                                                                        )
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    kg
                                                                </small>

                                                            </div>

                                                        </div>


                                                        <div className="doctor-stat-card">

                                                            <div className="doctor-stat-icon green">
                                                                📏
                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Height
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        getVitalValue(
                                                                            vital,
                                                                            "height"
                                                                        )
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    cm
                                                                </small>

                                                            </div>

                                                        </div>


                                                        <div className="doctor-stat-card">

                                                            <div className="doctor-stat-icon orange">
                                                                🫁
                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Respiratory Rate
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        getVitalValue(
                                                                            vital,
                                                                            "respiratoryRate",
                                                                            "respirationRate"
                                                                        )
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    /min
                                                                </small>

                                                            </div>

                                                        </div>


                                                        <div className="doctor-stat-card">

                                                            <div className="doctor-stat-icon purple">
                                                                🕐
                                                            </div>

                                                            <div>

                                                                <span>
                                                                    Recorded
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        getVitalValue(
                                                                            vital,
                                                                            "recordedAt",
                                                                            "createdAt",
                                                                            "date"
                                                                        )
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    Nurse record
                                                                </small>

                                                            </div>

                                                        </div>

                                                    </div>


                                                    <div
                                                        style={{
                                                            marginTop:
                                                                "24px"
                                                        }}
                                                    >

                                                        <h3>
                                                            Nursing Observations
                                                        </h3>

                                                        <div
                                                            style={{
                                                                background:
                                                                    "#f7fafc",
                                                                padding:
                                                                    "18px",
                                                                borderRadius:
                                                                    "10px",
                                                                marginTop:
                                                                    "10px"
                                                            }}
                                                        >

                                                            {
                                                                getVitalValue(
                                                                    vital,
                                                                    "nursingNotes",
                                                                    "nurseNotes",
                                                                    "observations",
                                                                    "notes"
                                                                )
                                                            }

                                                        </div>

                                                    </div>

                                                </>

                                            );

                                        })()}

                                    </div>

                                </div>

                            )}

                        </section>

                    )}


                    {/* =================================================
                        QUICK ACTIONS
                    ================================================= */}

                    <section className="doctor-section">

                        <div className="doctor-section-heading">

                            <div>

                                <h2>
                                    Quick Actions
                                </h2>

                                <p>
                                    Frequently used doctor functions
                                </p>

                            </div>

                        </div>


                        <div className="doctor-quick-grid">

                            <button
                                onClick={() =>
                                    navigate(
                                        "/doctor/prescriptions"
                                    )
                                }
                                className="doctor-quick-card"
                            >

                                <span>
                                    📅
                                </span>

                                <div>

                                    <strong>
                                        Appointments
                                    </strong>

                                    <small>
                                        View scheduled patients
                                    </small>

                                </div>

                            </button>


                            <button
                                onClick={() =>
                                    navigate(
                                        "/doctor/availability"
                                    )
                                }
                                className="doctor-quick-card"
                            >

                                <span>
                                    🕐
                                </span>

                                <div>

                                    <strong>
                                        Availability
                                    </strong>

                                    <small>
                                        Manage consultation slots
                                    </small>

                                </div>

                            </button>


                            <button
                                onClick={() =>
                                    navigate(
                                        "/doctor/prescriptions"
                                    )
                                }
                                className="doctor-quick-card"
                            >

                                <span>
                                    💊
                                </span>

                                <div>

                                    <strong>
                                        Prescriptions
                                    </strong>

                                    <small>
                                        Choose a patient to view or write prescriptions
                                    </small>

                                </div>

                            </button>


                            <button
                                onClick={() =>
                                    navigate(
                                        "/doctor/lab-orders"
                                    )
                                }
                                className="doctor-quick-card"
                            >

                                <span>
                                    🔬
                                </span>

                                <div>

                                    <strong>
                                        Lab Orders
                                    </strong>

                                    <small>
                                        Select a patient to order tests
                                    </small>

                                </div>

                            </button>

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
};

export default DoctorDashboard;