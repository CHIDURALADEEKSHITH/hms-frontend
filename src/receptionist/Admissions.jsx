import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./receptionist.css";

const Admissions = () => {

    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    // =========================================================
    // USER
    // =========================================================

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    // =========================================================
    // PATIENT SEARCH
    // =========================================================

    const [patientSearch, setPatientSearch] =
        useState("");

    const [patient, setPatient] =
        useState(null);

    const [searching, setSearching] =
        useState(false);

    // =========================================================
    // APPOINTMENTS
    // =========================================================

    const [appointments, setAppointments] =
        useState([]);

    const [selectedAppointment, setSelectedAppointment] =
        useState(null);

    const [loadingAppointments, setLoadingAppointments] =
        useState(false);

    // =========================================================
    // ADMISSION FORM
    // =========================================================

    const [admissionDate, setAdmissionDate] =
        useState(
            new Date().toLocaleDateString(
                "en-CA"
            )
        );

    const [reason, setReason] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    // =========================================================
    // MESSAGES
    // =========================================================

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    // =========================================================
    // SEARCH PATIENT
    // =========================================================

    const searchPatient = async () => {

        setMessage("");
        setError("");

        if (!patientSearch.trim()) {

            setError(
                "Please enter Patient ID or UHID."
            );

            return;
        }

        try {

            setSearching(true);

            const value =
                patientSearch.trim();

            let response;

            // -------------------------------------------------
            // UHID
            // -------------------------------------------------

            if (
                value
                    .toUpperCase()
                    .startsWith("UHID")
            ) {

                response =
                    await api.get(
                        `/receptionist/patient/uhid/${value}`
                    );

            } else if (
                /^\d+$/.test(value)
            ) {

                // Patient ID is numeric.
                // Try UHID form because existing
                // receptionist backend exposes UHID.
                response =
                    await api.get(
                        `/receptionist/patient/uhid/UHID${value}`
                    );

            } else {

                response =
                    await api.get(
                        `/receptionist/patient/uhid/${value}`
                    );

            }

            const foundPatient =
                response.data;

            setPatient(
                foundPatient
            );

            await loadAppointments(
                foundPatient.id
            );

        } catch (err) {

            console.error(
                "Patient search failed:",
                err
            );

            // Try mobile
            try {

                const mobileResponse =
                    await api.get(
                        `/receptionist/patient/mobile/${patientSearch.trim()}`
                    );

                const foundPatient =
                    mobileResponse.data;

                setPatient(
                    foundPatient
                );

                await loadAppointments(
                    foundPatient.id
                );

                setError("");

            } catch (mobileError) {

                console.error(
                    "Mobile search failed:",
                    mobileError
                );

                setPatient(null);
                setAppointments([]);
                setSelectedAppointment(null);

                setError(
                    "Patient not found."
                );

            }

        } finally {

            setSearching(false);

        }
    };

    // =========================================================
    // LOAD APPOINTMENTS
    // =========================================================

    const loadAppointments = async (
        patientId
    ) => {

        try {

            setLoadingAppointments(
                true
            );

            const response =
                await api.get(
                    "/receptionist/appointments"
                );

            const allAppointments =
                response.data || [];

            const patientAppointments =
                allAppointments.filter(
                    (appointment) =>
                        Number(
                            appointment.patient?.id
                        ) ===
                        Number(patientId)
                );

            setAppointments(
                patientAppointments
            );

        } catch (err) {

            console.error(
                "Unable to load appointments:",
                err
            );

            setAppointments([]);

            setError(
                "Unable to load appointments."
            );

        } finally {

            setLoadingAppointments(
                false
            );

        }
    };

    // =========================================================
    // SELECT APPOINTMENT
    // =========================================================

    const selectAppointment = (
        appointment
    ) => {

        setSelectedAppointment(
            appointment
        );

        setMessage("");
        setError("");
    };

    // =========================================================
    // CREATE ADMISSION
    // =========================================================

    const createAdmission = async (
        e
    ) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if (!patient) {

            setError(
                "Please select a patient."
            );

            return;
        }

        if (!selectedAppointment) {

            setError(
                "Please select an appointment."
            );

            return;
        }

        if (!reason.trim()) {

            setError(
                "Please enter the admission reason."
            );

            return;
        }

        try {

            setSaving(true);

            // =================================================
            // IMPORTANT
            //
            // Admission is now connected directly
            // to this appointment.
            // =================================================

            const admissionData = {

                patient: {
                    id: Number(
                        patient.id
                    )
                },

                doctor:
                    selectedAppointment.doctor
                        ? {
                              id: Number(
                                  selectedAppointment
                                      .doctor
                                      .id
                              )
                          }
                        : null,

                appointment: {
                    id: Number(
                        selectedAppointment.id
                    )
                },

                admissionDate:
                    admissionDate,

                reason:
                    reason,

                status:
                    "ADMITTED"
            };

            console.log(
                "Creating admission:",
                admissionData
            );

            const response =
                await api.post(
                    "/receptionist/admission",
                    admissionData
                );

            console.log(
                "Admission created:",
                response.data
            );

            setMessage(
                `Admission #${response.data.id} created successfully for appointment ${selectedAppointment.appointmentId}.`
            );

            setReason("");

        } catch (err) {

            console.error(
                "Admission creation failed:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            if (
                typeof err.response?.data ===
                "string"
            ) {

                setError(
                    err.response.data
                );

            } else {

                setError(
                    "Unable to create admission."
                );

            }

        } finally {

            setSaving(false);

        }
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {

        clearAuth();

        navigate("/");

    };

    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="receptionist-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="receptionist-sidebar">

                <div className="receptionist-logo">

                    <div className="receptionist-logo-icon">
                        +
                    </div>

                    <div>

                        <h2>
                            Thilak Hospital
                        </h2>

                        <span>
                            Receptionist Portal
                        </span>

                    </div>

                </div>

                <nav className="receptionist-nav">

                    <button
                        onClick={() =>
                            navigate(
                                "/receptionist"
                            )
                        }
                    >
                        <span>▣</span>
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/receptionist/patients"
                            )
                        }
                    >
                        <span>👥</span>
                        Patient Search
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/receptionist/appointments"
                            )
                        }
                    >
                        <span>📅</span>
                        Appointments
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/receptionist/walk-in"
                            )
                        }
                    >
                        <span>🚶</span>
                        Walk-In
                    </button>

                    <button
                        className="active"
                    >
                        <span>🏥</span>
                        Admissions
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/receptionist/billing"
                            )
                        }
                    >
                        <span>💳</span>
                        Billing
                    </button>

                </nav>

                <button
                    className="receptionist-logout"
                    onClick={logout}
                >
                    ⇥ Logout
                </button>

            </aside>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="receptionist-main">

                <header className="receptionist-header">

                    <div>

                        <p className="receptionist-label">
                            HOSPITAL ADMISSIONS
                        </p>

                        <h1>
                            Admissions
                        </h1>

                        <p>
                            Select the patient's appointment
                            before creating an admission.
                        </p>

                    </div>

                </header>

                {/* =================================================
                    MESSAGES
                ================================================= */}

                {message && (

                    <div className="receptionist-success">

                        {message}

                    </div>

                )}

                {error && (

                    <div className="receptionist-error">

                        {error}

                    </div>

                )}

                {/* =================================================
                    1. SEARCH PATIENT
                ================================================= */}

                <section className="receptionist-form-card">

                    <div className="receptionist-form-heading">

                        <h2>
                            1. Search Patient
                        </h2>

                        <p>
                            Search using Patient ID,
                            UHID or mobile number.
                        </p>

                    </div>

                    <div
                        style={{
                            display:
                                "flex",
                            gap:
                                "12px",
                            alignItems:
                                "end"
                        }}
                    >

                        <div
                            className="receptionist-form-group"
                            style={{
                                flex: 1
                            }}
                        >

                            <label>
                                Patient ID / UHID / Mobile
                            </label>

                            <input
                                type="text"
                                value={
                                    patientSearch
                                }
                                onChange={(e) =>
                                    setPatientSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Example: 10001 / UHID10001"
                            />

                        </div>

                        <button
                            type="button"
                            className="receptionist-primary-btn"
                            onClick={
                                searchPatient
                            }
                            disabled={
                                searching
                            }
                        >

                            {searching
                                ? "Searching..."
                                : "Search Patient"}

                        </button>

                    </div>

                </section>

                {/* =================================================
                    PATIENT DETAILS
                ================================================= */}

                {patient && (

                    <section className="receptionist-form-card">

                        <div className="receptionist-form-heading">

                            <h2>
                                Patient Details
                            </h2>

                        </div>

                        <div
                            className="receptionist-form-grid"
                        >

                            <div className="receptionist-form-group">

                                <label>
                                    Patient ID
                                </label>

                                <input
                                    value={
                                        patient.id ||
                                        ""
                                    }
                                    readOnly
                                />

                            </div>

                            <div className="receptionist-form-group">

                                <label>
                                    UHID
                                </label>

                                <input
                                    value={
                                        patient.uhid ||
                                        ""
                                    }
                                    readOnly
                                />

                            </div>

                            <div className="receptionist-form-group">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    value={
                                        patient.fullName ||
                                        ""
                                    }
                                    readOnly
                                />

                            </div>

                            <div className="receptionist-form-group">

                                <label>
                                    Mobile
                                </label>

                                <input
                                    value={
                                        patient.mobile ||
                                        ""
                                    }
                                    readOnly
                                />

                            </div>

                        </div>

                    </section>

                )}

                {/* =================================================
                    2. APPOINTMENTS
                ================================================= */}

                {patient && (

                    <section className="receptionist-section">

                        <div className="receptionist-section-heading">

                            <div>

                                <h2>
                                    2. Select Appointment
                                </h2>

                                <p>
                                    Admission will be linked
                                    to the selected appointment.
                                </p>

                            </div>

                        </div>

                        {loadingAppointments ? (

                            <div className="receptionist-empty">
                                Loading appointments...
                            </div>

                        ) : appointments.length === 0 ? (

                            <div className="receptionist-empty">
                                No appointments found.
                            </div>

                        ) : (

                            <div
                                style={{
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    gap:
                                        "10px"
                                }}
                            >

                                {appointments.map(
                                    (appointment) => {

                                        const selected =
                                            selectedAppointment?.id ===
                                            appointment.id;

                                        return (

                                            <button
                                                key={
                                                    appointment.id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    selectAppointment(
                                                        appointment
                                                    )
                                                }
                                                style={{
                                                    width:
                                                        "100%",
                                                    textAlign:
                                                        "left",
                                                    border:
                                                        selected
                                                            ? "2px solid #14b8a6"
                                                            : "1px solid #dce5e9",
                                                    background:
                                                        selected
                                                            ? "#effcf9"
                                                            : "#fff",
                                                    borderRadius:
                                                        "10px",
                                                    padding:
                                                        "16px",
                                                    cursor:
                                                        "pointer"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between"
                                                    }}
                                                >

                                                    <strong>
                                                        {
                                                            appointment.appointmentId
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            appointment.status
                                                        }
                                                    </span>

                                                </div>

                                                <div
                                                    style={{
                                                        display:
                                                            "grid",
                                                        gridTemplateColumns:
                                                            "repeat(4, 1fr)",
                                                        gap:
                                                            "20px",
                                                        marginTop:
                                                            "10px"
                                                    }}
                                                >

                                                    <div>

                                                        <small>
                                                            Doctor
                                                        </small>

                                                        <div>
                                                            {
                                                                appointment
                                                                    .doctor
                                                                    ?.fullName ||
                                                                "N/A"
                                                            }
                                                        </div>

                                                    </div>

                                                    <div>

                                                        <small>
                                                            Date
                                                        </small>

                                                        <div>
                                                            {
                                                                appointment.appointmentDate
                                                            }
                                                        </div>

                                                    </div>

                                                    <div>

                                                        <small>
                                                            Time
                                                        </small>

                                                        <div>
                                                            {
                                                                appointment.appointmentTime
                                                            }
                                                        </div>

                                                    </div>

                                                    <div>

                                                        <small>
                                                            Reason
                                                        </small>

                                                        <div>
                                                            {
                                                                appointment.reason ||
                                                                "-"
                                                            }
                                                        </div>

                                                    </div>

                                                </div>

                                            </button>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </section>

                )}

                {/* =================================================
                    3. CREATE ADMISSION
                ================================================= */}

                {selectedAppointment && (

                    <section className="receptionist-form-card">

                        <div className="receptionist-form-heading">

                            <h2>
                                3. Create Admission
                            </h2>

                            <p>
                                Admission will be created
                                for appointment{" "}
                                <strong>
                                    {
                                        selectedAppointment.appointmentId
                                    }
                                </strong>
                                .
                            </p>

                        </div>

                        <form
                            onSubmit={
                                createAdmission
                            }
                        >

                            <div
                                className="receptionist-form-grid"
                            >

                                <div className="receptionist-form-group">

                                    <label>
                                        Appointment ID
                                    </label>

                                    <input
                                        value={
                                            selectedAppointment
                                                .appointmentId ||
                                            ""
                                        }
                                        readOnly
                                    />

                                </div>

                                <div className="receptionist-form-group">

                                    <label>
                                        Doctor
                                    </label>

                                    <input
                                        value={
                                            selectedAppointment
                                                .doctor
                                                ?.fullName ||
                                            ""
                                        }
                                        readOnly
                                    />

                                </div>

                                <div className="receptionist-form-group">

                                    <label>
                                        Admission Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            admissionDate
                                        }
                                        onChange={(e) =>
                                            setAdmissionDate(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>

                                <div className="receptionist-form-group">

                                    <label>
                                        Status
                                    </label>

                                    <input
                                        value="ADMITTED"
                                        readOnly
                                    />

                                </div>

                            </div>

                            <div
                                className="receptionist-form-group full"
                            >

                                <label>
                                    Admission Reason
                                </label>

                                <textarea
                                    rows="4"
                                    value={
                                        reason
                                    }
                                    onChange={(e) =>
                                        setReason(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter reason for admission..."
                                    required
                                />

                            </div>

                            <div
                                className="receptionist-form-actions"
                            >

                                <button
                                    type="button"
                                    className="receptionist-secondary-btn"
                                    onClick={() =>
                                        navigate(
                                            "/receptionist"
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="receptionist-primary-btn"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving
                                        ? "Creating Admission..."
                                        : "Create Admission"}

                                </button>

                            </div>

                        </form>

                    </section>

                )}

            </main>

        </div>

    );
};

export default Admissions;