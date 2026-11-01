import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./doctor.css";

const Appointments = () => {

    const navigate = useNavigate();
    const { user } = useAuth();

    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =========================================================
    // LOAD APPOINTMENTS
    // =========================================================

    useEffect(() => {

        if (user?.userId) {
            loadAppointments();
        }

    }, [user?.userId]);


    // =========================================================
    // GET DOCTOR APPOINTMENTS
    // =========================================================

    const loadAppointments = async () => {

        try {

            setLoading(true);
            setError("");

            if (!user?.userId) {
                setError("Doctor information is missing.");
                return;
            }

            const response = await api.get(
                `/doctor/${user.userId}/appointments`
            );

            setAppointments(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Appointments loading error:",
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


    // =========================================================
    // GET PATIENT ID
    // =========================================================

    const getPatientId = (appointment) => {

        return (
            appointment?.patient?.id ??
            appointment?.patientId ??
            appointment?.patient?.userId
        );

    };


    // =========================================================
    // GET PATIENT NAME
    // =========================================================

    const getPatientName = (appointment) => {

        return (
            appointment?.patient?.fullName ||
            appointment?.patient?.name ||
            appointment?.patientName ||
            appointment?.patient?.patientName ||
            getPatientId(appointment) ||
            "-"
        );

    };


    // =========================================================
    // CHECK VERIFICATION
    // =========================================================

    const isVerified = (appointment) => {

        return Boolean(
            appointment?.verified ??
            appointment?.isVerified
        );

    };


    // =========================================================
    // SEARCH / FILTER
    // =========================================================

    const filteredAppointments =
        appointments.filter((appointment) => {

            const value =
                search.toLowerCase().trim();

            if (!value) {
                return true;
            }

            return (

                String(
                    appointment?.id || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    appointment?.appointmentId || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    getPatientName(appointment)
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    getPatientId(appointment) || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    appointment?.status || ""
                )
                    .toLowerCase()
                    .includes(value)

            );

        });


    // =========================================================
    // OPEN PATIENT DETAILS
    // =========================================================

    const openPatientDetails = (appointment) => {

        const currentPatientId =
            getPatientId(appointment);

        const currentAppointmentId =
            appointment?.id;


        if (!currentPatientId) {

            alert(
                "Patient ID is missing."
            );

            return;
        }


        if (!currentAppointmentId) {

            alert(
                "Appointment ID is missing."
            );

            return;
        }


        console.log(
            "Opening patient:",
            currentPatientId
        );

        console.log(
            "Opening appointment:",
            currentAppointmentId
        );


        /*
         * IMPORTANT:
         *
         * We pass BOTH:
         *
         * patientId
         * appointment.id
         *
         * Example:
         *
         * /doctor/patient/10001/15
         */

        navigate(
            `/doctor/patient/${currentPatientId}/${currentAppointmentId}`,
            {
                state: {
                    patient:
                        appointment?.patient || null,

                    appointment:
                        appointment
                }
            }
        );

    };


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="doctor-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="doctor-page-header">

                <div>

                    <h1>
                        Appointments
                    </h1>

                    <p>
                        View and manage your patient appointments
                    </p>

                </div>


                <button
                    className="doctor-back-button"
                    onClick={() =>
                        navigate("/doctor")
                    }
                >
                    ← Dashboard
                </button>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="doctor-toolbar">

                <div className="doctor-search">

                    <span>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search by patient, ID or status..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <button
                    className="doctor-refresh-button"
                    onClick={loadAppointments}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="doctor-error">
                    {error}
                </div>

            )}


            {/* =================================================
                APPOINTMENTS TABLE
            ================================================= */}

            <div className="doctor-table-card">

                {loading ? (

                    <div className="doctor-loading">

                        Loading appointments...

                    </div>

                ) : filteredAppointments.length === 0 ? (

                    <div className="doctor-empty">

                        <div>
                            📅
                        </div>

                        <h3>
                            No Appointments Found
                        </h3>

                        <p>
                            No appointments are currently available.
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
                                        Appointment Reference
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
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredAppointments.map(
                                    (appointment) => (

                                        <tr
                                            key={
                                                appointment?.id ||
                                                appointment?.appointmentId
                                            }
                                        >

                                            {/* DATABASE ID */}

                                            <td>

                                                <strong>
                                                    {
                                                        appointment?.id ||
                                                        "-"
                                                    }
                                                </strong>

                                            </td>


                                            {/* BUSINESS APPOINTMENT ID */}

                                            <td>

                                                {appointment?.appointmentId ||
                                                    "-"}

                                            </td>


                                            {/* PATIENT */}

                                            <td>

                                                {getPatientName(
                                                    appointment
                                                )}

                                            </td>


                                            {/* DATE */}

                                            <td>

                                                {
                                                    appointment?.date ||
                                                    appointment?.appointmentDate ||
                                                    "-"
                                                }

                                            </td>


                                            {/* TIME */}

                                            <td>

                                                {
                                                    appointment?.time ||
                                                    appointment?.appointmentTime ||
                                                    "-"
                                                }

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span className="doctor-status">

                                                    {
                                                        appointment?.status ||
                                                        "SCHEDULED"
                                                    }

                                                    {isVerified(
                                                        appointment
                                                    ) &&

                                                        String(
                                                            appointment?.status ||
                                                            ""
                                                        ).toUpperCase() !==
                                                        "VERIFIED" &&

                                                        " · VERIFIED"

                                                    }

                                                </span>

                                            </td>


                                            {/* ACTION */}

                                            <td>

                                                <button
                                                    className="doctor-view-button"
                                                    onClick={() =>
                                                        openPatientDetails(
                                                            appointment
                                                        )
                                                    }
                                                    disabled={
                                                        !getPatientId(
                                                            appointment
                                                        ) ||
                                                        !appointment?.id
                                                    }
                                                >

                                                    Patient

                                                </button>

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


export default Appointments;