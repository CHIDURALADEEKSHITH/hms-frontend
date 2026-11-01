import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./nurse.css";

const Patients = () => {

    const navigate = useNavigate();

    const { logout: clearAuthSession } = useAuth();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const nurseId = user.userId;


    // =========================================================
    // STATES
    // =========================================================

    const [patients, setPatients] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =========================================================
    // LOAD PATIENTS + APPOINTMENTS
    // =========================================================

    useEffect(() => {

        if (nurseId) {
            loadPatients();
        }

    }, [nurseId]);


    const loadPatients = async () => {

        try {

            setLoading(true);

            setError("");


            // -------------------------------------------------
            // Get all patients
            // -------------------------------------------------

            const response = await api.get(
                `/nurse/${nurseId}/patients`
            );


            const patientList =
                response.data || [];


            // -------------------------------------------------
            // Get appointments for every patient
            // -------------------------------------------------

            const patientsWithAppointments =
                await Promise.all(

                    patientList.map(
                        async (patient) => {

                            try {

                                const appointmentResponse =
                                    await api.get(
                                        `/nurse/patient/${patient.id}/appointments`
                                    );


                                return {

                                    ...patient,

                                    appointments:
                                        appointmentResponse.data || []

                                };

                            } catch (appointmentError) {

                                console.error(
                                    `Unable to load appointments for patient ${patient.id}:`,
                                    appointmentError
                                );


                                return {

                                    ...patient,

                                    appointments: []

                                };

                            }

                        }
                    )

                );


            setPatients(
                patientsWithAppointments
            );


        } catch (err) {

            console.error(
                "Unable to load patients:",
                err
            );

            setError(
                "Unable to load patients."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // SEARCH
    // =========================================================

    const filteredPatients =
        patients.filter((patient) => {

            const searchText =
                search.toLowerCase();


            return (

                String(
                    patient.fullName ||
                    patient.patientName ||
                    ""
                )
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(
                    patient.uhid || ""
                )
                    .toLowerCase()
                    .includes(searchText)

                ||

                String(
                    patient.mobile || ""
                )
                    .includes(searchText)

            );

        });


    // =========================================================
    // OPEN VITALS
    // =========================================================

    const openVitals = (
        patientId,
        appointmentId
    ) => {

        if (!appointmentId) {

            setError(
                "Please select a valid appointment."
            );

            return;

        }


        navigate(
            `/nurse/vitals?patientId=${patientId}&appointmentId=${appointmentId}`
        );

    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {

        clearAuthSession();

        navigate(
            "/",
            {
                replace: true
            }
        );

    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        try {

            return new Date(
                date
            ).toLocaleDateString();

        } catch {

            return date;

        }

    };


    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTime = (time) => {

        if (!time) {
            return "";
        }

        return String(time).substring(
            0,
            5
        );

    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="nurse-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="nurse-sidebar">


                <div className="nurse-logo">

                    <div className="logo-icon">
                        +
                    </div>


                    <div>

                        <h2>
                            Thilak Hospital
                        </h2>

                        <span>
                            Nurse Portal
                        </span>

                    </div>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav className="nurse-nav">


                    <button
                        onClick={() =>
                            navigate("/nurse")
                        }
                    >

                        <span>
                            ▣
                        </span>

                        Dashboard

                    </button>


                    <button className="active">

                        <span>
                            👥
                        </span>

                        Patients

                    </button>


                    <button
                        onClick={() =>
                            navigate("/nurse/vitals")
                        }
                    >

                        <span>
                            ♥
                        </span>

                        Patient Vitals

                    </button>


                    <button
                        onClick={() =>
                            navigate("/nurse/notes")
                        }
                    >

                        <span>
                            📝
                        </span>

                        Nursing Notes

                    </button>


                </nav>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <button
                    className="nurse-logout"
                    onClick={logout}
                >

                    ⇥ Logout

                </button>


            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="nurse-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="nurse-header">


                    <div>

                        <p className="page-label">
                            PATIENT MANAGEMENT
                        </p>


                        <h1>
                            Patients
                        </h1>


                        <p>
                            View patient information and nursing details.
                        </p>

                    </div>


                    {/* USER */}

                    <div className="nurse-user">


                        <div className="nurse-avatar">

                            {(user.name || "N")
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div>

                            <strong>
                                {user.name || "Nurse"}
                            </strong>


                            <span>
                                Nurse ID: {nurseId}
                            </span>

                        </div>

                    </div>


                </header>


                {/* =================================================
                    PATIENT SECTION
                ================================================= */}

                <section className="nurse-section">


                    {/* SEARCH */}

                    <div className="search-box">


                        <span>
                            🔍
                        </span>


                        <input
                            type="text"
                            placeholder="Search by patient name, UHID or mobile number..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />


                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="error-message">

                            {error}

                        </div>

                    )}


                    {/* LOADING */}

                    {loading ? (

                        <div className="nurse-empty">

                            Loading patients and appointments...

                        </div>


                    ) : filteredPatients.length === 0 ? (

                        <div className="nurse-empty">

                            No patients found.

                        </div>


                    ) : (


                        <div className="nurse-table-container">


                            <table className="nurse-table">


                                <thead>

                                    <tr>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            UHID
                                        </th>

                                        <th>
                                            Mobile
                                        </th>

                                        <th>
                                            Appointments
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>


                                    {filteredPatients.map(
                                        (patient, index) => {


                                            const appointments =
                                                patient.appointments ||
                                                [];


                                            return (

                                                <tr
                                                    key={
                                                        patient.id ||
                                                        index
                                                    }
                                                >


                                                    {/* PATIENT */}

                                                    <td>

                                                        <div className="patient-name-cell">


                                                            <div className="small-avatar">

                                                                {(
                                                                    patient.fullName ||
                                                                    patient.patientName ||
                                                                    "P"
                                                                )
                                                                    .charAt(0)
                                                                    .toUpperCase()}

                                                            </div>


                                                            <strong>

                                                                {patient.fullName ||
                                                                    patient.patientName ||
                                                                    "Patient"}

                                                            </strong>


                                                        </div>

                                                    </td>


                                                    {/* UHID */}

                                                    <td>

                                                        {patient.uhid ||
                                                            "-"}

                                                    </td>


                                                    {/* MOBILE */}

                                                    <td>

                                                        {patient.mobile ||
                                                            "-"}

                                                    </td>


                                                    {/* APPOINTMENTS */}

                                                    <td>


                                                        {appointments.length ===
                                                        0 ? (

                                                            <span>
                                                                No appointments
                                                            </span>

                                                        ) : (

                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    flexDirection:
                                                                        "column",
                                                                    gap:
                                                                        "8px"
                                                                }}
                                                            >

                                                                {appointments.map(
                                                                    (
                                                                        appointment
                                                                    ) => (

                                                                        <div
                                                                            key={
                                                                                appointment.id
                                                                            }
                                                                            style={{
                                                                                display:
                                                                                    "flex",
                                                                                alignItems:
                                                                                    "center",
                                                                                gap:
                                                                                    "10px",
                                                                                padding:
                                                                                    "8px",
                                                                                border:
                                                                                    "1px solid #e2e8f0",
                                                                                borderRadius:
                                                                                    "8px",
                                                                                background:
                                                                                    "#f8fafc"
                                                                            }}
                                                                        >

                                                                            <div>

                                                                                <strong>

                                                                                    {appointment.appointmentId ||
                                                                                        `Appointment #${appointment.id}`}

                                                                                </strong>


                                                                                <div
                                                                                    style={{
                                                                                        fontSize:
                                                                                            "12px",
                                                                                        color:
                                                                                            "#64748b",
                                                                                        marginTop:
                                                                                            "3px"
                                                                                    }}
                                                                                >

                                                                                    {formatDate(
                                                                                        appointment.appointmentDate
                                                                                    )}

                                                                                    {" "}

                                                                                    {formatTime(
                                                                                        appointment.appointmentTime
                                                                                    )}

                                                                                    {" • "}

                                                                                    {appointment.status ||
                                                                                        "PENDING"}

                                                                                </div>

                                                                            </div>


                                                                            <button
                                                                                className="small-action-btn"
                                                                                onClick={() =>
                                                                                    openVitals(
                                                                                        patient.id,
                                                                                        appointment.id
                                                                                    )
                                                                                }
                                                                            >

                                                                                Record Vitals

                                                                            </button>

                                                                        </div>

                                                                    )
                                                                )}

                                                            </div>

                                                        )}

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span className="status-badge">

                                                            {patient.status ||
                                                                "ACTIVE"}

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


        </div>

    );

};


export default Patients;