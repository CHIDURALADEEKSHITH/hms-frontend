import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./admin.css";

const AppointmentManagement = () => {

    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================================
    // LOAD APPOINTMENTS
    // =========================================

    const loadAppointments = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/appointments"
            );

            setAppointments(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Error loading appointments:",
                err
            );

            setAppointments([]);

            if (err.response?.data) {

                setError(
                    typeof err.response.data === "string"
                        ? err.response.data
                        : "Unable to load appointments."
                );

            } else {

                setError(
                    "Unable to connect to the server."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // =========================================
    // LOAD WHEN PAGE OPENS
    // =========================================

    useEffect(() => {

        loadAppointments();

    }, []);


    // =========================================
    // SEARCH
    // =========================================

    const filteredAppointments =
        appointments.filter((appointment) => {

            const value =
                search.toLowerCase().trim();

            if (!value) {
                return true;
            }

            return (

                String(
                    appointment.id || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    appointment.appointmentId || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    appointment.patient?.fullName || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    appointment.doctor?.fullName || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    appointment.patient?.uhid || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    appointment.status || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    appointment.reason || ""
                )
                    .toLowerCase()
                    .includes(value)
            );
        });


    // =========================================
    // FORMAT STATUS
    // =========================================

    const getStatusClass = (status) => {

        switch (
            String(status || "").toUpperCase()
        ) {

            case "BOOKED":
            case "CONFIRMED":
                return "status-approved";

            case "PENDING":
                return "status-pending";

            case "CANCELLED":
            case "REJECTED":
                return "status-rejected";

            case "COMPLETED":
                return "status-approved";

            case "NO_SHOW":
                return "status-inactive";

            default:
                return "status-default";
        }
    };


    // =========================================
    // FORMAT TIME
    // =========================================

    const formatTime = (time) => {

        if (!time) {
            return "-";
        }

        return String(time).substring(0, 5);
    };


    return (

        <div className="admin-page">

            {/* =================================
                HEADER
            ================================= */}

            <div className="admin-page-header">

                <div>

                    <h1>
                        Appointment Management
                    </h1>

                    <p>
                        Monitor hospital appointments and schedules
                    </p>

                </div>


                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/admin")
                    }
                >
                    ← Dashboard
                </button>

            </div>


            {/* =================================
                TOOLBAR
            ================================= */}

            <div className="admin-toolbar">

                <div className="search-box">

                    <span>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search by appointment ID, patient, doctor or status..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <button
                    className="refresh-button"
                    onClick={loadAppointments}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* =================================
                ERROR
            ================================= */}

            {error && (

                <div className="admin-error">

                    {error}

                </div>
            )}


            {/* =================================
                TABLE CARD
            ================================= */}

            <div className="admin-table-card">

                <div className="table-header">

                    <div>

                        <h2>
                            Appointments
                        </h2>

                        <span>
                            {filteredAppointments.length}
                            {" "}
                            appointment(s)
                        </span>

                    </div>

                </div>


                {/* =================================
                    LOADING
                ================================= */}

                {loading ? (

                    <div className="admin-loading">

                        <div className="admin-spinner"></div>

                        <p>
                            Loading appointments...
                        </p>

                    </div>


                ) : filteredAppointments.length === 0 ? (

                    /* =================================
                       EMPTY
                    ================================= */

                    <div className="admin-empty">

                        <div className="empty-icon">
                            📅
                        </div>

                        <h3>
                            No Appointments Found
                        </h3>

                        <p>
                            {search
                                ? "No appointments match your search."
                                : "There are currently no appointment records."}
                        </p>

                    </div>


                ) : (

                    /* =================================
                       TABLE
                    ================================= */

                    <div className="table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        APPOINTMENT ID
                                    </th>

                                    <th>
                                        PATIENT
                                    </th>

                                    <th>
                                        DOCTOR
                                    </th>

                                    <th>
                                        DEPARTMENT
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

                                {filteredAppointments.map(
                                    (appointment) => (

                                        <tr
                                            key={
                                                appointment.id
                                            }
                                        >

                                            {/* ID */}

                                            <td>

                                                <strong>
                                                    {
                                                        appointment.id
                                                    }
                                                </strong>

                                            </td>


                                            {/* APPOINTMENT ID */}

                                            <td>

                                                <strong>
                                                    {
                                                        appointment.appointmentId ||
                                                        "-"
                                                    }
                                                </strong>

                                            </td>


                                            {/* PATIENT */}

                                            <td>

                                                <div className="appointment-person">

                                                    <div className="appointment-avatar">
                                                        {
                                                            appointment.patient?.fullName
                                                                ?.charAt(0)
                                                                ?.toUpperCase() || "P"
                                                        }
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                appointment.patient?.fullName ||
                                                                "-"
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                appointment.patient?.uhid ||
                                                                appointment.patient?.mobile ||
                                                                ""
                                                            }
                                                        </small>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* DOCTOR */}

                                            <td>

                                                <div className="appointment-person">

                                                    <div className="appointment-avatar doctor-avatar">
                                                        {
                                                            appointment.doctor?.fullName
                                                                ?.charAt(0)
                                                                ?.toUpperCase() || "D"
                                                        }
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                appointment.doctor?.fullName ||
                                                                "-"
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                appointment.doctor?.specialization ||
                                                                ""
                                                            }
                                                        </small>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* DEPARTMENT */}

                                            <td>

                                                {
                                                    appointment.department?.name ||
                                                    appointment.department?.departmentName ||
                                                    "-"
                                                }

                                            </td>


                                            {/* DATE */}

                                            <td>

                                                {
                                                    appointment.appointmentDate ||
                                                    "-"
                                                }

                                            </td>


                                            {/* TIME */}

                                            <td>

                                                {
                                                    formatTime(
                                                        appointment.appointmentTime
                                                    )
                                                }

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`status-badge ${getStatusClass(
                                                        appointment.status
                                                    )}`}
                                                >
                                                    {
                                                        appointment.status ||
                                                        "UNKNOWN"
                                                    }
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
};

export default AppointmentManagement;