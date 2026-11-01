import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./doctor.css";

const LabOrders = () => {

    const navigate = useNavigate();
    const { patientId: routePatientId } = useParams();
    const { user } = useAuth();

    // Patient ID entered by doctor
    const [patientId, setPatientId] = useState(
        routePatientId || ""
    );

    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [patientLoading, setPatientLoading] = useState(false);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);

    const [patientError, setPatientError] = useState("");
    const [appointmentsError, setAppointmentsError] = useState("");

    const [formData, setFormData] = useState({
        testCategory: "",
        testName: "",
        clinicalReason: "",
        priority: "NORMAL",
        instructions: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    /*
     * If patientId comes from URL,
     * automatically load that patient.
     */
    useEffect(() => {

        if (routePatientId) {
            setPatientId(routePatientId);
            loadPatient(routePatientId);
        }

    }, [routePatientId]);


    /*
     * Load patient information and appointments
     */
    const loadPatient = async (id) => {

        if (!id || !id.trim()) {
            setPatientError("Please enter a Patient ID.");
            return;
        }

        try {

            setPatientLoading(true);
            setPatientError("");
            setAppointmentsError("");
            setMessage("");
            setError("");

            setPatient(null);
            setAppointments([]);
            setSelectedAppointment(null);

            /*
             * Get doctor's appointments.
             * Then find appointments belonging
             * to the entered patient.
             */
            const response = await api.get(
                `/doctor/${user.userId}/appointments`
            );

            const allAppointments = Array.isArray(response.data)
                ? response.data
                : [];

            const patientAppointments = allAppointments.filter(
                (appointment) => {

                    const appointmentPatientId =
                        appointment?.patient?.id ??
                        appointment?.patientId ??
                        appointment?.patient?.userId;

                    return String(appointmentPatientId) === String(id);
                }
            );

            if (patientAppointments.length === 0) {

                setPatientError(
                    "No patient or appointments found for this Patient ID."
                );

                return;
            }

            /*
             * Get patient information from appointment data
             */
            const patientData =
                patientAppointments[0]?.patient;

            setPatient(
                patientData || {
                    id: id,
                    fullName: `Patient ${id}`
                }
            );

            setAppointments(patientAppointments);

        } catch (err) {

            console.error(
                "Unable to load patient:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setPatientError(
                typeof err.response?.data === "string"
                    ? err.response.data
                    : "Unable to load patient information."
            );

        } finally {

            setPatientLoading(false);
        }
    };


    /*
     * Patient ID search
     */
    const handlePatientSearch = (e) => {

        e.preventDefault();

        loadPatient(patientId);
    };


    /*
     * Appointment selection
     */
    const handleAppointmentSelect = (e) => {

        const appointmentId = e.target.value;

        if (!appointmentId) {

            setSelectedAppointment(null);
            return;
        }

        const appointment = appointments.find(
            (item) =>
                String(item.id) === String(appointmentId)
        );

        setSelectedAppointment(
            appointment || null
        );

        setMessage("");
        setError("");
    };


    /*
     * Form input changes
     */
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };


    /*
     * Create laboratory order
     */
    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if (!patient) {

            setError(
                "Please enter a valid Patient ID first."
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

                doctor: {
                    id: user?.userId
                },

                patient: {
                    id: patient.id
                },

                appointment: {
                    id: selectedAppointment.id
                },

                testCategory:
                    formData.testCategory,

                testName:
                    formData.testName,

                clinicalReason:
                    formData.clinicalReason,

                priority:
                    formData.priority,

                instructions:
                    formData.instructions
            };

            console.log(
                "Creating lab order:",
                data
            );

            await api.post(
                "/doctor/lab-test",
                data
            );

            setMessage(
                "Laboratory order created successfully."
            );

            /*
             * Reset only the lab form.
             * Keep patient and appointment selected.
             */
            setFormData({
                testCategory: "",
                testName: "",
                clinicalReason: "",
                priority: "NORMAL",
                instructions: ""
            });

        } catch (err) {

            console.error(
                "Unable to create lab order:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                typeof err.response?.data === "string"
                    ? err.response.data
                    : "Unable to create laboratory order."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="doctor-page">

            {/* HEADER */}

            <div className="doctor-page-header">

                <div>

                    <h1>
                        Lab Orders
                    </h1>

                    <p>
                        Order diagnostic tests for your patients
                    </p>

                </div>

                <button
                    className="doctor-back-button"
                    onClick={() =>
                        navigate(
                            patientId
                                ? `/doctor/patient/${patientId}`
                                : "/doctor"
                        )
                    }
                >
                    {patientId
                        ? "← Patient Details"
                        : "← Dashboard"}
                </button>

            </div>


            <div className="doctor-form-card">


                {/* PATIENT ID SEARCH */}

                <div className="consultation-patient-banner">

                    <div className="consultation-patient-icon">
                        🔬
                    </div>

                    <div>

                        <span>
                            Enter Patient ID
                        </span>

                        <strong>
                            {patientId || "Patient ID"}
                        </strong>

                    </div>

                </div>


                <form
                    onSubmit={handlePatientSearch}
                    style={{
                        marginBottom: "25px"
                    }}
                >

                    <div className="doctor-form-group">

                        <label>
                            Patient ID
                        </label>

                        <div
                            style={{
                                display: "flex",
                                gap: "10px"
                            }}
                        >

                            <input
                                type="number"
                                value={patientId}
                                onChange={(e) =>
                                    setPatientId(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter Patient ID"
                                required
                            />

                            <button
                                type="submit"
                                className="doctor-primary-button"
                                disabled={
                                    patientLoading
                                }
                            >
                                {patientLoading
                                    ? "Searching..."
                                    : "Find Patient"}
                            </button>

                        </div>

                    </div>

                </form>


                {/* PATIENT ERROR */}

                {patientError && (

                    <div className="doctor-error">
                        {patientError}
                    </div>

                )}


                {/* PATIENT INFORMATION */}

                {patient && (

                    <div
                        className="consultation-patient-banner"
                        style={{
                            marginBottom: "25px"
                        }}
                    >

                        <div className="consultation-patient-icon">
                            👤
                        </div>

                        <div>

                            <span>
                                Patient
                            </span>

                            <strong>
                                {patient.fullName}
                            </strong>

                            <div
                                style={{
                                    marginTop: "5px"
                                }}
                            >
                                Patient ID:{" "}
                                {patient.id}
                            </div>

                        </div>

                    </div>

                )}


                {/* APPOINTMENT SELECTION */}

                {patient && (

                    <div
                        className="doctor-form-group"
                        style={{
                            marginBottom: "25px"
                        }}
                    >

                        <label>
                            Select Appointment
                        </label>

                        {appointmentsLoading ? (

                            <div className="doctor-loading">
                                Loading appointments...
                            </div>

                        ) : appointmentsError ? (

                            <div className="doctor-error">
                                {appointmentsError}
                            </div>

                        ) : appointments.length === 0 ? (

                            <div className="doctor-empty">

                                <h3>
                                    No appointments found
                                </h3>

                                <p>
                                    This patient does not have
                                    any appointments with you.
                                </p>

                            </div>

                        ) : (

                            <select
                                value={
                                    selectedAppointment?.id || ""
                                }
                                onChange={
                                    handleAppointmentSelect
                                }
                            >

                                <option value="">
                                    Select an appointment
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

                                            {appointment.appointmentId ||
                                                `Appointment ${appointment.id}`}
                                            {" — "}
                                            {appointment.appointmentDate ||
                                                "Date not available"}
                                            {" "}
                                            {appointment.appointmentTime ||
                                                ""}

                                        </option>

                                    )
                                )}

                            </select>

                        )}

                    </div>

                )}


                {/* SELECTED APPOINTMENT DETAILS */}

                {selectedAppointment && (

                    <div
                        className="consultation-patient-banner"
                        style={{
                            marginBottom: "25px"
                        }}
                    >

                        <div className="consultation-patient-icon">
                            📅
                        </div>

                        <div>

                            <span>
                                Selected Appointment
                            </span>

                            <strong>
                                {selectedAppointment.appointmentId ||
                                    selectedAppointment.id}
                            </strong>

                            <div
                                style={{
                                    marginTop: "5px"
                                }}
                            >
                                Date:{" "}
                                {selectedAppointment.appointmentDate ||
                                    "-"}
                                {" | "}
                                Time:{" "}
                                {selectedAppointment.appointmentTime ||
                                    "-"}
                            </div>

                            <div
                                style={{
                                    marginTop: "5px"
                                }}
                            >
                                Status:{" "}
                                {selectedAppointment.status ||
                                    "-"}
                            </div>

                        </div>

                    </div>

                )}


                {/* SUCCESS */}

                {message && (

                    <div className="doctor-success">
                        {message}
                    </div>

                )}


                {/* GENERAL ERROR */}

                {error && (

                    <div className="doctor-error">
                        {error}
                    </div>

                )}


                {/* LAB ORDER FORM */}

                {selectedAppointment && (

                    <form onSubmit={handleSubmit}>

                        <div className="doctor-form-grid">


                            {/* CATEGORY */}

                            <div className="doctor-form-group">

                                <label>
                                    Test Category
                                </label>

                                <select
                                    name="testCategory"
                                    value={
                                        formData.testCategory
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Category
                                    </option>

                                    <option value="PATHOLOGY">
                                        Pathology
                                    </option>

                                    <option value="CARDIAC">
                                        Cardiac
                                    </option>

                                    <option value="RADIOLOGY">
                                        Radiology
                                    </option>

                                    <option value="URINE">
                                        Urine
                                    </option>

                                    <option value="THYROID">
                                        Thyroid
                                    </option>

                                    <option value="VITAMIN">
                                        Vitamin
                                    </option>

                                    <option value="OTHER">
                                        Other
                                    </option>

                                </select>

                            </div>


                            {/* TEST NAME */}

                            <div className="doctor-form-group">

                                <label>
                                    Test Name
                                </label>

                                <input
                                    type="text"
                                    name="testName"
                                    value={
                                        formData.testName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter test name"
                                    required
                                />

                            </div>


                            {/* PRIORITY */}

                            <div className="doctor-form-group">

                                <label>
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={
                                        formData.priority
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="NORMAL">
                                        Normal
                                    </option>

                                    <option value="URGENT">
                                        Urgent
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* CLINICAL REASON */}

                        <div className="doctor-form-group">

                            <label>
                                Clinical Reason
                            </label>

                            <textarea
                                name="clinicalReason"
                                value={
                                    formData.clinicalReason
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Why is this test required?"
                                rows="4"
                                required
                            />

                        </div>


                        {/* INSTRUCTIONS */}

                        <div className="doctor-form-group">

                            <label>
                                Instructions
                            </label>

                            <textarea
                                name="instructions"
                                value={
                                    formData.instructions
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Additional instructions..."
                                rows="3"
                            />

                        </div>


                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="doctor-primary-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating..."
                                : "Create Lab Order"}

                        </button>

                    </form>

                )}

            </div>

        </div>
    );
};

export default LabOrders;