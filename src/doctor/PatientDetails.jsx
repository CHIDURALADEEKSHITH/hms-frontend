    import { useEffect, useState } from "react";
    import {
        useLocation,
        useNavigate,
        useParams
    } from "react-router-dom";

    import api from "../services/api";
    import "./doctor.css";


    const PatientDetails = () => {

        const navigate = useNavigate();
        const location = useLocation();


        // =========================================================
        // URL PARAMETERS
        // =========================================================

        const {
            patientId,
            appointmentId
        } = useParams();


        // =========================================================
        // APPOINTMENT FROM NAVIGATION STATE
        // =========================================================

        const appointment =
            location.state?.appointment || null;


        // =========================================================
        // PATIENT STATE
        // =========================================================

        const [patient, setPatient] = useState(
            location.state?.patient || null
        );


        const [loading, setLoading] = useState(
            !location.state?.patient
        );


        const [error, setError] = useState("");


        // =========================================================
        // LOAD PATIENT
        // =========================================================

        useEffect(() => {

            console.log(
                "PatientDetails - patientId:",
                patientId
            );

            console.log(
                "PatientDetails - appointmentId:",
                appointmentId
            );

            console.log(
                "PatientDetails - appointment:",
                appointment
            );


            // -----------------------------------------------------
            // IF PATIENT WAS PASSED FROM APPOINTMENTS
            // -----------------------------------------------------

            if (location.state?.patient) {

                setPatient(
                    location.state.patient
                );

                setLoading(false);

                return;

            }


            // -----------------------------------------------------
            // CHECK PATIENT ID
            // -----------------------------------------------------

            if (
                !patientId ||
                patientId === "undefined" ||
                patientId === "null"
            ) {

                setError(
                    "Patient ID is missing."
                );

                setLoading(false);

                return;

            }


            // -----------------------------------------------------
            // LOAD PATIENT FROM BACKEND
            // -----------------------------------------------------

            loadPatient();

        }, [
            patientId,
            appointmentId,
            location.state
        ]);


        // =========================================================
        // GET PATIENT FROM BACKEND
        // =========================================================

        const loadPatient = async () => {

            try {

                setLoading(true);
                setError("");

                console.log(
                    "Loading patient with ID:",
                    patientId
                );


                const response = await api.get(
                    `/doctor/patient/${patientId}`
                );


                console.log(
                    "Patient response:",
                    response.data
                );


                setPatient(
                    response.data
                );

            } catch (err) {

                console.error(
                    "Patient details error:",
                    err
                );


                setError(
                    err.response?.data ||
                    "Unable to load patient details."
                );

            } finally {

                setLoading(false);

            }

        };


        // =========================================================
        // LOADING SCREEN
        // =========================================================

        if (loading) {

            return (

                <div className="doctor-page">

                    <div className="doctor-loading">

                        Loading patient information...

                    </div>

                </div>

            );

        }


        // =========================================================
        // ERROR SCREEN
        // =========================================================

        if (error || !patient) {

            return (

                <div className="doctor-page">

                    <div className="doctor-error">

                        {error ||
                            "Patient information not found."}

                    </div>


                    <button
                        className="doctor-back-button"
                        onClick={() =>
                            navigate(
                                "/doctor/appointments"
                            )
                        }
                    >

                        ← Appointments

                    </button>

                </div>

            );

        }


        // =========================================================
        // CURRENT PATIENT ID
        // =========================================================

        const currentPatientId =
            patient?.id || patientId;


        // =========================================================
        // CURRENT APPOINTMENT ID
        // =========================================================

        /*
        * appointmentId comes from the URL.
        *
        * appointment?.id is used as fallback
        * when navigating with state.
        */

        const currentAppointmentId =
            appointmentId ||
            appointment?.id;


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
                            Patient Details
                        </h1>

                        <p>
                            Patient information and clinical details
                        </p>

                    </div>


                    <button
                        className="doctor-back-button"
                        onClick={() =>
                            navigate(
                                "/doctor/appointments"
                            )
                        }
                    >

                        ← Appointments

                    </button>

                </div>


                {/* =================================================
                    PATIENT PROFILE
                ================================================= */}

                <div className="patient-profile-card">


                    {/* PATIENT HEADER */}

                    <div className="patient-profile-header">

                        <div className="patient-large-avatar">

                            {
                                patient.fullName
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                "P"
                            }

                        </div>


                        <div>

                            <h2>

                                {
                                    patient.fullName ||
                                    "Patient"
                                }

                            </h2>


                            <span className="patient-uhid">

                                UHID:{" "}

                                {
                                    patient.uhid ||
                                    "-"
                                }

                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        PATIENT INFORMATION
                    ================================================= */}

                    <div className="doctor-details-grid">


                        {/* PATIENT ID */}

                        <div className="doctor-detail">

                            <label>
                                Patient ID
                            </label>

                            <strong>

                                {
                                    currentPatientId ||
                                    "-"
                                }

                            </strong>

                        </div>


                        {/* UHID */}

                        <div className="doctor-detail">

                            <label>
                                UHID
                            </label>

                            <strong>

                                {
                                    patient.uhid ||
                                    "-"
                                }

                            </strong>

                        </div>


                        {/* DATABASE APPOINTMENT ID */}

                        <div className="doctor-detail">

                            <label>
                                Appointment ID
                            </label>

                            <strong>

                                {
                                    currentAppointmentId ||
                                    "-"
                                }

                            </strong>

                        </div>


                        {/* BUSINESS APPOINTMENT ID */}

                        <div className="doctor-detail">

                            <label>
                                Appointment Reference
                            </label>

                            <strong>

                                {
                                    appointment?.appointmentId ||
                                    "-"
                                }

                            </strong>

                        </div>


                        {/* MOBILE */}

                        <div className="doctor-detail">

                            <label>
                                Mobile
                            </label>

                            <strong>

                                {
                                    patient.mobile ||
                                    "-"
                                }

                            </strong>

                        </div>


                        {/* EMAIL */}

                        <div className="doctor-detail">

                            <label>
                                Email
                            </label>

                            <strong>

                                {
                                    patient.email ||
                                    "-"
                                }

                            </strong>

                        </div>


                        {/* DATE OF BIRTH */}

                        <div className="doctor-detail">

                            <label>
                                Date of Birth
                            </label>

                            <strong>

                                {
                                    patient.dateOfBirth ||
                                    "-"
                                }

                            </strong>

                        </div>


                        {/* GENDER */}

                        <div className="doctor-detail">

                            <label>
                                Gender
                            </label>

                            <strong>

                                {
                                    patient.gender ||
                                    "-"
                                }

                            </strong>

                        </div>


                        {/* ACCOUNT STATUS */}

                        <div className="doctor-detail">

                            <label>
                                Account Status
                            </label>

                            <strong>

                                {
                                    patient.status ||
                                    "ACTIVE"
                                }

                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    PATIENT ACTIONS
                ================================================= */}

                <div className="doctor-patient-actions">


                    {/* =================================================
                        START CONSULTATION
                    ================================================= */}

                    <button
                        className="doctor-primary-button"
                        onClick={() => {

                            if (!currentAppointmentId) {

                                alert(
                                    "Appointment ID is missing."
                                );

                                return;

                            }


                            navigate(
                                `/doctor/consultation/${currentPatientId}/${currentAppointmentId}`
                            );

                        }}
                    >

                        🩺 Start Consultation

                    </button>


                    {/* =================================================
                        PRESCRIPTIONS
                    ================================================= */}

                    <button
                        className="doctor-secondary-button"
                        onClick={() => {

                            if (!currentAppointmentId) {

                                alert(
                                    "Appointment ID is missing."
                                );

                                return;

                            }


                            navigate(
                                `/doctor/prescriptions/${currentPatientId}/${currentAppointmentId}`
                            );

                        }}
                    >

                        💊 Prescriptions

                    </button>


                    {/* =================================================
                        LAB ORDERS
                    ================================================= */}

                    <button
                        className="doctor-secondary-button"
                        onClick={() => {

                            if (!currentAppointmentId) {

                                alert(
                                    "Appointment ID is missing."
                                );

                                return;

                            }


                            navigate(
                                `/doctor/lab-orders/${currentPatientId}/${currentAppointmentId}`
                            );

                        }}
                    >

                        🧪 Lab Orders

                    </button>


                    {/* =================================================
                        BACK TO APPOINTMENTS
                    ================================================= */}

                    <button
                        className="doctor-secondary-button"
                        onClick={() =>
                            navigate(
                                "/doctor/appointments"
                            )
                        }
                    >

                        📅 Appointments

                    </button>

                </div>

            </div>

        );

    };


    export default PatientDetails;