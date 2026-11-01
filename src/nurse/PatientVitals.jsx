import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./nurse.css";

const PatientVitals = () => {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { logout: clearAuthSession } = useAuth();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const nurseId = user.userId;


    // =========================================================
    // URL VALUES
    // =========================================================

    const urlPatientId =
        searchParams.get("patientId");

    const urlAppointmentId =
        searchParams.get("appointmentId");


    // =========================================================
    // STATES
    // =========================================================

    const [patients, setPatients] = useState([]);

    const [appointments, setAppointments] = useState([]);

    const [selectedPatient, setSelectedPatient] =
        useState(urlPatientId || "");

    const [selectedAppointment, setSelectedAppointment] =
        useState(urlAppointmentId || "");

    const [existingVitals, setExistingVitals] =
        useState(null);


    const [formData, setFormData] = useState({

        temperature: "",
        weight: "",
        height: "",
        bloodPressure: "",
        pulse: "",
        spo2: "",
        respiratoryRate: "",
        nursingObservations: ""

    });


    const [loading, setLoading] =
        useState(false);

    const [loadingAppointments, setLoadingAppointments] =
        useState(false);

    const [loadingVitals, setLoadingVitals] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    // =========================================================
    // LOAD PATIENTS
    // =========================================================

    useEffect(() => {

        if (nurseId) {
            loadPatients();
        }

    }, [nurseId]);


    const loadPatients = async () => {

        try {

            const response = await api.get(
                `/nurse/${nurseId}/patients`
            );

            setPatients(
                response.data || []
            );

        } catch (err) {

            console.error(
                "Unable to load patients:",
                err
            );

            setError(
                "Unable to load patients."
            );

        }

    };


    // =========================================================
    // LOAD APPOINTMENTS WHEN PATIENT IS SELECTED
    // =========================================================

    useEffect(() => {

        if (selectedPatient) {

            loadPatientAppointments(
                selectedPatient
            );

        } else {

            setAppointments([]);
            setSelectedAppointment("");
            clearVitalsForm();

        }

    }, [selectedPatient]);


    const loadPatientAppointments = async (
        patientId
    ) => {

        try {

            setLoadingAppointments(true);

            setError("");

            setMessage("");


            const response = await api.get(
                `/nurse/patient/${patientId}/appointments`
            );


            const data =
                response.data || [];


            console.log(
                "Appointments for patient:",
                patientId,
                data
            );


            setAppointments(data);


            // =================================================
            // IF URL HAS APPOINTMENT ID
            // =================================================

            if (urlAppointmentId) {

                const exists =
                    data.some(
                        (appointment) =>
                            String(
                                appointment.id
                            ) ===
                            String(
                                urlAppointmentId
                            )
                    );


                if (exists) {

                    setSelectedAppointment(
                        urlAppointmentId
                    );

                } else {

                    setSelectedAppointment("");

                }

            } else {

                // No appointment selected yet

                setSelectedAppointment("");

                clearVitalsForm();

            }

        } catch (err) {

            console.error(
                "Unable to load appointments:",
                err
            );

            setAppointments([]);

            setSelectedAppointment("");

            clearVitalsForm();

            setError(
                "Unable to load patient appointments."
            );

        } finally {

            setLoadingAppointments(false);

        }

    };


    // =========================================================
    // LOAD VITALS WHEN APPOINTMENT IS SELECTED
    // =========================================================

    useEffect(() => {

        if (selectedAppointment) {

            loadAppointmentVitals(
                selectedAppointment
            );

        } else {

            clearVitalsForm();

            setExistingVitals(null);

        }

    }, [selectedAppointment]);


    const loadAppointmentVitals = async (
        appointmentId
    ) => {

        try {

            setLoadingVitals(true);

            setError("");

            setMessage("");


            console.log(
                "Loading vitals for appointment:",
                appointmentId
            );


            const response = await api.get(
                `/nurse/appointment/${appointmentId}/vitals`
            );


            const data =
                response.data || [];


            console.log(
                "Vitals for appointment:",
                appointmentId,
                data
            );


            if (data.length > 0) {

                const latestVital =
                    data[data.length - 1];


                setExistingVitals(
                    latestVital
                );


                setFormData({

                    temperature:
                        latestVital.temperature ?? "",

                    weight:
                        latestVital.weight ?? "",

                    height:
                        latestVital.height ?? "",

                    bloodPressure:
                        latestVital.bloodPressure ?? "",

                    pulse:
                        latestVital.pulse ?? "",

                    spo2:
                        latestVital.spo2 ?? "",

                    respiratoryRate:
                        latestVital.respiratoryRate ?? "",

                    nursingObservations:
                        latestVital.nursingNotes ?? ""

                });

            } else {

                setExistingVitals(null);

                clearVitalsForm();

            }

        } catch (err) {

            console.error(
                "Unable to load appointment vitals:",
                err
            );

            setExistingVitals(null);

            clearVitalsForm();

        } finally {

            setLoadingVitals(false);

        }

    };


    // =========================================================
    // CLEAR FORM
    // =========================================================

    const clearVitalsForm = () => {

        setFormData({

            temperature: "",
            weight: "",
            height: "",
            bloodPressure: "",
            pulse: "",
            spo2: "",
            respiratoryRate: "",
            nursingObservations: ""

        });

    };


    // =========================================================
    // PATIENT CHANGE
    // =========================================================

    const handlePatientChange = (e) => {

        const patientId =
            e.target.value;


        setSelectedPatient(
            patientId
        );

        setSelectedAppointment("");

        setAppointments([]);

        setExistingVitals(null);

        clearVitalsForm();

        setMessage("");

        setError("");

    };


    // =========================================================
    // APPOINTMENT CHANGE
    // =========================================================

    const handleAppointmentChange = (e) => {

        const appointmentId =
            e.target.value;


        setSelectedAppointment(
            appointmentId
        );

        setMessage("");

        setError("");

    };


    // =========================================================
    // INPUT CHANGE
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData(
            (previousData) => ({

                ...previousData,

                [name]: value

            })
        );

    };


    // =========================================================
    // SAVE VITALS
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        if (!selectedPatient) {

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


        try {

            setLoading(true);


            const data = {

                patient: {

                    id: Number(
                        selectedPatient
                    )

                },

                appointment: {

                    id: Number(
                        selectedAppointment
                    )

                },

                temperature:
                    formData.temperature !== ""
                        ? Number(
                            formData.temperature
                        )
                        : null,

                weight:
                    formData.weight !== ""
                        ? Number(
                            formData.weight
                        )
                        : null,

                height:
                    formData.height !== ""
                        ? Number(
                            formData.height
                        )
                        : null,

                bloodPressure:
                    formData.bloodPressure,

                pulse:
                    formData.pulse !== ""
                        ? Number(
                            formData.pulse
                        )
                        : null,

                spo2:
                    formData.spo2 !== ""
                        ? Number(
                            formData.spo2
                        )
                        : null,

                respiratoryRate:
                    formData.respiratoryRate !== ""
                        ? Number(
                            formData.respiratoryRate
                        )
                        : null,

                nursingNotes:
                    formData.nursingObservations

            };


            console.log(
                "Saving vitals:",
                data
            );


            const response =
                await api.post(
                    "/nurse/vitals",
                    data
                );


            console.log(
                "Vitals saved:",
                response.data
            );


            setExistingVitals(
                response.data
            );


            setMessage(
                "Patient vitals recorded successfully."
            );


        } catch (err) {

            console.error(
                "Vitals save error:",
                err
            );


            if (err.response?.data) {

                setError(

                    typeof err.response.data === "string"

                        ? err.response.data

                        : "Unable to save patient vitals."

                );

            } else {

                setError(
                    "Unable to save patient vitals."
                );

            }

        } finally {

            setLoading(false);

        }

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
    // FORMAT APPOINTMENT
    // =========================================================

    const formatAppointment = (
        appointment
    ) => {

        const date =
            appointment.appointmentDate
                ? new Date(
                    appointment.appointmentDate
                ).toLocaleDateString()
                : "Date not available";


        const time =
            appointment.appointmentTime
                ? String(
                    appointment.appointmentTime
                ).substring(0, 5)
                : "";


        const status =
            appointment.status ||
            "PENDING";


        return `${appointment.appointmentId ||
            `Appointment #${appointment.id}`
            } | ${date}${time ? ` | ${time}` : ""
            } | ${status}`;

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


                    <button
                        onClick={() =>
                            navigate("/nurse/patients")
                        }
                    >

                        <span>
                            👥
                        </span>

                        Patients

                    </button>


                    <button className="active">

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


                <header className="nurse-header">


                    <div>

                        <p className="page-label">
                            PATIENT CARE
                        </p>


                        <h1>
                            Patient Vitals
                        </h1>


                        <p>
                            Record and update patient vital signs.
                        </p>

                    </div>


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
                    FORM CARD
                ================================================= */}

                <section className="nurse-form-card">


                    <div className="form-card-heading">

                        <h2>
                            Record Patient Vitals
                        </h2>


                        <p>
                            Select a patient and appointment, then enter the current vital measurements.
                        </p>

                    </div>


                    {/* =================================================
                        CURRENT SELECTION
                    ================================================= */}

                    <div
                        style={{
                            marginBottom: "20px",
                            padding: "14px 18px",
                            borderRadius: "10px",
                            background: "#f5f7fa",
                            border: "1px solid #e2e8f0"
                        }}
                    >

                        <strong>
                            Selected Appointment:
                        </strong>

                        <span
                            style={{
                                marginLeft: "10px"
                            }}
                        >

                            {selectedAppointment
                                ? (
                                    appointments.find(
                                        (appointment) =>
                                            String(
                                                appointment.id
                                            ) ===
                                            String(
                                                selectedAppointment
                                            )
                                    )?.appointmentId ||
                                    `Appointment #${selectedAppointment}`
                                )
                                : "Not selected"}

                        </span>

                    </div>


                    {/* SUCCESS */}

                    {message && (

                        <div className="success-message">

                            {message}

                        </div>

                    )}


                    {/* ERROR */}

                    {error && (

                        <div className="error-message">

                            {error}

                        </div>

                    )}


                    <form onSubmit={handleSubmit}>


                        <div className="nurse-form-grid">


                            {/* =================================================
                                PATIENT DROPDOWN
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Patient
                                </label>


                                <select
                                    value={
                                        selectedPatient
                                    }
                                    onChange={
                                        handlePatientChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Patient
                                    </option>


                                    {patients.map(
                                        (patient) => (

                                            <option
                                                key={
                                                    patient.id
                                                }
                                                value={
                                                    patient.id
                                                }
                                            >

                                                {patient.fullName ||
                                                    patient.patientName ||
                                                    "Patient"}

                                                {" "}

                                                {patient.uhid
                                                    ? `- ${patient.uhid}`
                                                    : ""}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* =================================================
                                APPOINTMENT DROPDOWN
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Appointment
                                </label>


                                <select
                                    value={
                                        selectedAppointment
                                    }
                                    onChange={
                                        handleAppointmentChange
                                    }
                                    disabled={
                                        !selectedPatient ||
                                        loadingAppointments
                                    }
                                    required
                                >

                                    <option value="">

                                        {loadingAppointments
                                            ? "Loading appointments..."
                                            : appointments.length === 0
                                                ? "No appointments found"
                                                : "Select Appointment"}

                                    </option>


                                    {appointments.map(
                                        (appointment) => (

                                            <option
                                                key={
                                                    appointment.id
                                                }
                                                value={
                                                    appointment.id
                                                }
                                            >

                                                {formatAppointment(
                                                    appointment
                                                )}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* =================================================
                                TEMPERATURE
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Temperature (°F)
                                </label>


                                <input
                                    type="number"
                                    step="0.1"
                                    name="temperature"
                                    value={
                                        formData.temperature
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 98.6"
                                />

                            </div>


                            {/* =================================================
                                WEIGHT
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Weight (kg)
                                </label>


                                <input
                                    type="number"
                                    step="0.1"
                                    name="weight"
                                    value={
                                        formData.weight
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 65"
                                />

                            </div>


                            {/* =================================================
                                HEIGHT
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Height (cm)
                                </label>


                                <input
                                    type="number"
                                    step="0.1"
                                    name="height"
                                    value={
                                        formData.height
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 170"
                                />

                            </div>


                            {/* =================================================
                                BLOOD PRESSURE
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Blood Pressure
                                </label>


                                <input
                                    type="text"
                                    name="bloodPressure"
                                    value={
                                        formData.bloodPressure
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 120/80"
                                />

                            </div>


                            {/* =================================================
                                PULSE
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Pulse (bpm)
                                </label>


                                <input
                                    type="number"
                                    name="pulse"
                                    value={
                                        formData.pulse
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 72"
                                />

                            </div>


                            {/* =================================================
                                SPO2
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    SpO₂ (%)
                                </label>


                                <input
                                    type="number"
                                    name="spo2"
                                    value={
                                        formData.spo2
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 98"
                                />

                            </div>


                            {/* =================================================
                                RESPIRATORY RATE
                            ================================================= */}

                            <div className="form-group">

                                <label>
                                    Respiratory Rate (/min)
                                </label>


                                <input
                                    type="number"
                                    name="respiratoryRate"
                                    value={
                                        formData.respiratoryRate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 18"
                                />

                            </div>


                        </div>


                        {/* =================================================
                            NURSING OBSERVATIONS
                        ================================================= */}

                        <div className="form-group full-width">

                            <label>
                                Nursing Observations
                            </label>


                            <textarea
                                name="nursingObservations"
                                value={
                                    formData.nursingObservations
                                }
                                onChange={
                                    handleChange
                                }
                                rows="5"
                                placeholder="Enter observations..."
                            />

                        </div>


                        {/* =================================================
                            EXISTING VITALS MESSAGE
                        ================================================= */}

                        {loadingVitals && (

                            <div className="success-message">

                                Loading vitals for selected appointment...

                            </div>

                        )}


                        {existingVitals && !loadingVitals && (

                            <div className="success-message">

                                Existing vitals loaded for the selected appointment.

                            </div>

                        )}


                        {/* =================================================
                            ACTIONS
                        ================================================= */}

                        <div className="form-actions">


                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() =>
                                    navigate("/nurse")
                                }
                            >

                                Cancel

                            </button>


                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={
                                    loading ||
                                    loadingAppointments ||
                                    loadingVitals ||
                                    !selectedPatient ||
                                    !selectedAppointment
                                }
                            >

                                {loading
                                    ? "Saving..."
                                    : existingVitals
                                        ? "Update Vitals"
                                        : "Save Vitals"}

                            </button>


                        </div>


                    </form>


                </section>


            </main>


        </div>

    );

};


export default PatientVitals;