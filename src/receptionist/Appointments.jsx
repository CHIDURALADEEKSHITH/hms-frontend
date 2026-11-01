import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./receptionist.css";

const Appointments = () => {

    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    // Get logged-in receptionist
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const receptionistId = user.userId;

    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =========================================================
    // LOAD APPOINTMENTS
    // =========================================================

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {

        try {

            setLoading(true);
            setError("");

            /*
             * Backend:
             *
             * GET /receptionist/{userId}/appointments
             *
             * Example:
             * GET /receptionist/50001/appointments
             */

            const response = await api.get(
                `/receptionist/${receptionistId}/appointments`
            );

            setAppointments(response.data || []);

        } catch (err) {

            console.error("Error loading appointments:", err);

            setError(
                err.response?.data ||
                "Unable to load appointments."
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // UPDATE APPOINTMENT STATUS
    // =========================================================

    const updateStatus = async (appointmentId, status) => {

        setMessage("");
        setError("");

        try {

            let endpoint = "";

            /*
             * Backend endpoints:
             *
             * CONFIRMED  -> /appointment/{id}/confirm
             * CHECKED_IN -> /appointment/{id}/check-in
             * CANCELLED  -> /appointment/{id}/cancel
             * NO_SHOW    -> /appointment/{id}/no-show
             */

            switch (status) {

                case "CONFIRMED":

                    endpoint =
                        `/receptionist/appointment/${appointmentId}/confirm`;

                    break;

                case "CHECKED_IN":

                    endpoint =
                        `/receptionist/appointment/${appointmentId}/check-in`;

                    break;

                case "CANCELLED":

                    endpoint =
                        `/receptionist/appointment/${appointmentId}/cancel`;

                    break;

                case "NO_SHOW":

                    endpoint =
                        `/receptionist/appointment/${appointmentId}/no-show`;

                    break;

                default:
                    return;
            }

            await api.put(endpoint);

            setMessage(
                `Appointment ${status
                    .toLowerCase()
                    .replace("_", " ")} successfully.`
            );

            // Reload appointments
            await loadAppointments();

        } catch (err) {

            console.error("Error updating appointment:", err);

            setError(
                err.response?.data ||
                "Unable to update appointment status."
            );
        }
    };

    // =========================================================
    // FILTER APPOINTMENTS
    // =========================================================

    const filteredAppointments =
        filter === "ALL"
            ? appointments
            : appointments.filter(
                (appointment) =>
                    String(appointment.status || "").toUpperCase() ===
                    filter
            );

    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {
        clearAuth();
        navigate("/");
    };

    // =========================================================
    // FORMAT STATUS
    // =========================================================

    const formatStatus = (status) => {

        if (!status) {
            return "PENDING";
        }

        return status
            .replaceAll("_", " ")
            .toUpperCase();
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        try {

            return new Date(date).toLocaleDateString();

        } catch {

            return date;
        }
    };

    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="receptionist-page">

            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside className="receptionist-sidebar">

                <div className="receptionist-logo">

                    <div className="receptionist-logo-icon">
                        +
                    </div>

                    <div>

                        <h2>Thilak Hospital</h2>

                        <span>
                            Receptionist Portal
                        </span>

                    </div>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav className="receptionist-nav">

                    <button
                        onClick={() =>
                            navigate("/receptionist")
                        }
                    >
                        <span>▣</span>
                        Dashboard
                    </button>


                    <button
                        onClick={() =>
                            navigate("/receptionist/patients")
                        }
                    >
                        <span>👥</span>
                        Patient Search
                    </button>


                    <button className="active">
                        <span>📅</span>
                        Appointments
                    </button>


                    <button
                        onClick={() =>
                            navigate("/receptionist/walk-in")
                        }
                    >
                        <span>🚶</span>
                        Walk-In
                    </button>


                    <button
                        onClick={() =>
                            navigate("/receptionist/admissions")
                        }
                    >
                        <span>🏥</span>
                        Admissions
                    </button>


                    <button
                        onClick={() =>
                            navigate("/receptionist/billing")
                        }
                    >
                        <span>💳</span>
                        Billing
                    </button>

                </nav>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <button
                    className="receptionist-logout"
                    onClick={logout}
                >
                    ⇥ Logout
                </button>

            </aside>


            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <main className="receptionist-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="receptionist-header">

                    <div>

                        <p className="receptionist-label">
                            APPOINTMENT MANAGEMENT
                        </p>

                        <h1>
                            Appointments
                        </h1>

                        <p>
                            Verify, check-in, reschedule and manage
                            patient appointments.
                        </p>

                    </div>

                </header>


                {/* =================================================
                    APPOINTMENT SECTION
                ================================================= */}

                <section className="receptionist-section">

                    {/* =================================================
                        FILTER BAR
                    ================================================= */}

                    <div className="receptionist-filter-bar">

                        <div>

                            <h2>
                                Appointment List
                            </h2>

                            <p>
                                Manage the complete appointment
                                lifecycle.
                            </p>

                        </div>


                        {/* =================================================
                            FILTER BUTTONS
                        ================================================= */}

                        <div className="receptionist-filters">

                            {[
                                "ALL",
                                "PENDING",
                                "CONFIRMED",
                                "CHECKED_IN",
                                "COMPLETED",
                                "CANCELLED",
                                "NO_SHOW"
                            ].map((status) => (

                                <button
                                    key={status}
                                    className={
                                        filter === status
                                            ? "filter-btn active"
                                            : "filter-btn"
                                    }
                                    onClick={() =>
                                        setFilter(status)
                                    }
                                >

                                    {status.replaceAll("_", " ")}

                                </button>

                            ))}

                        </div>

                    </div>


                    {/* =================================================
                        SUCCESS MESSAGE
                    ================================================= */}

                    {message && (

                        <div className="receptionist-success">

                            {message}

                        </div>

                    )}


                    {/* =================================================
                        ERROR MESSAGE
                    ================================================= */}

                    {error && (

                        <div className="receptionist-error">

                            {error}

                        </div>

                    )}


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading ? (

                        <div className="receptionist-empty">

                            Loading appointments...

                        </div>

                    ) : filteredAppointments.length === 0 ? (

                        /* =================================================
                            NO APPOINTMENTS
                        ================================================= */

                        <div className="receptionist-empty">

                            No appointments found.

                        </div>

                    ) : (

                        /* =================================================
                            APPOINTMENT TABLE
                        ================================================= */

                        <div className="receptionist-table-wrapper">

                            <table className="receptionist-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Appointment ID
                                        </th>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            Doctor
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
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredAppointments.map(
                                        (appointment, index) => (

                                            <tr
                                                key={
                                                    appointment.id ||
                                                    appointment.appointmentId ||
                                                    index
                                                }
                                            >

                                                {/* =================================================
                                                    APPOINTMENT ID
                                                ================================================= */}

                                                <td>

                                                    <strong>

                                                        {
                                                            appointment.appointmentId ||
                                                            appointment.id ||
                                                            "-"
                                                        }

                                                    </strong>

                                                </td>


                                                {/* =================================================
                                                    PATIENT
                                                ================================================= */}

                                                <td>

                                                    <strong>

                                                        {
                                                            appointment.patient?.fullName ||
                                                            appointment.patientName ||
                                                            appointment.fullName ||
                                                            "Patient"
                                                        }

                                                    </strong>

                                                    {appointment.patient?.uhid && (

                                                        <small
                                                            style={{
                                                                display: "block",
                                                                marginTop: "4px"
                                                            }}
                                                        >
                                                            UHID:{" "}
                                                            {
                                                                appointment.patient.uhid
                                                            }
                                                        </small>

                                                    )}

                                                </td>


                                                {/* =================================================
                                                    DOCTOR
                                                ================================================= */}

                                                <td>

                                                    {
                                                        appointment.doctor?.fullName ||
                                                        appointment.doctorName ||
                                                        "Doctor"
                                                    }

                                                </td>


                                                {/* =================================================
                                                    DATE
                                                ================================================= */}

                                                <td>

                                                    {
                                                        formatDate(
                                                            appointment.appointmentDate
                                                        )
                                                    }

                                                </td>


                                                {/* =================================================
                                                    TIME
                                                ================================================= */}

                                                <td>

                                                    {
                                                        appointment.appointmentTime ||
                                                        appointment.time ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* =================================================
                                                    STATUS
                                                ================================================= */}

                                                <td>

                                                    <span
                                                        className="receptionist-status"
                                                    >

                                                        {
                                                            formatStatus(
                                                                appointment.status
                                                            )
                                                        }

                                                    </span>

                                                </td>


                                                {/* =================================================
                                                    ACTIONS
                                                ================================================= */}

                                                <td>

                                                    <div
                                                        className="appointment-actions"
                                                    >

                                                        {/* CONFIRM */}

                                                        {String(
                                                            appointment.status ||
                                                            ""
                                                        ).toUpperCase() ===
                                                            "PENDING" && (

                                                            <button
                                                                className="receptionist-small-btn green"
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        appointment.id,
                                                                        "CONFIRMED"
                                                                    )
                                                                }
                                                            >
                                                                Confirm
                                                            </button>

                                                        )}


                                                        {/* CHECK-IN */}

                                                        {(
                                                            String(
                                                                appointment.status ||
                                                                ""
                                                            ).toUpperCase() ===
                                                                "CONFIRMED" ||
                                                            String(
                                                                appointment.status ||
                                                                ""
                                                            ).toUpperCase() ===
                                                                "PENDING"
                                                        ) && (

                                                            <button
                                                                className="receptionist-small-btn blue"
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        appointment.id,
                                                                        "CHECKED_IN"
                                                                    )
                                                                }
                                                            >
                                                                Check-In
                                                            </button>

                                                        )}


                                                        {/* CANCEL */}

                                                        {(
                                                            String(
                                                                appointment.status ||
                                                                ""
                                                            ).toUpperCase() !==
                                                                "CANCELLED" &&
                                                            String(
                                                                appointment.status ||
                                                                ""
                                                            ).toUpperCase() !==
                                                                "COMPLETED"
                                                        ) && (

                                                            <button
                                                                className="receptionist-small-btn red"
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        appointment.id,
                                                                        "CANCELLED"
                                                                    )
                                                                }
                                                            >
                                                                Cancel
                                                            </button>

                                                        )}


                                                        {/* NO SHOW */}

                                                        {(
                                                            String(
                                                                appointment.status ||
                                                                ""
                                                            ).toUpperCase() ===
                                                                "CONFIRMED" ||
                                                            String(
                                                                appointment.status ||
                                                                ""
                                                            ).toUpperCase() ===
                                                                "CHECKED_IN"
                                                        ) && (

                                                            <button
                                                                className="receptionist-small-btn"
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        appointment.id,
                                                                        "NO_SHOW"
                                                                    )
                                                                }
                                                            >
                                                                No-Show
                                                            </button>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
};

export default Appointments;