import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./receptionist.css";

const WalkIn = () => {
    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const receptionistId = user.userId;

    // =========================================================
    // PATIENT TYPE
    // =========================================================

    const [patientType, setPatientType] = useState("EXISTING");

    // =========================================================
    // PATIENT DATA
    // =========================================================

    const [existingPatientId, setExistingPatientId] = useState("");

    const [newPatient, setNewPatient] = useState({
        fullName: "",
        mobile: "",
        email: "",
        dateOfBirth: "",
        gender: ""
    });

    const [patient, setPatient] = useState(null);

    // =========================================================
    // DOCTOR DATA
    // =========================================================

    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] =
        useState("");

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState("");

    // =========================================================
    // APPOINTMENT DATA
    // =========================================================

    const [appointmentData, setAppointmentData] = useState({
        appointmentDate: "",
        appointmentTime: "",
        reason: ""
    });

    // =========================================================
    // UI STATE
    // =========================================================

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [patientLoading, setPatientLoading] = useState(false);
    const [doctorLoading, setDoctorLoading] = useState(false);

    // =========================================================
    // TODAY
    // =========================================================

    const today = new Date().toLocaleDateString("en-CA");

    // =========================================================
    // LOAD SPECIALIZATIONS
    // =========================================================

    useEffect(() => {
        loadSpecializations();
    }, []);

    const loadSpecializations = async () => {
        try {
            const response = await api.get(
                "/doctor/specializations"
            );

            console.log(
                "Specializations:",
                response.data
            );

            setSpecializations(response.data || []);

        } catch (err) {

            console.error(
                "Unable to load specializations:",
                err
            );

            setError(
                "Unable to load doctor specializations."
            );
        }
    };

    // =========================================================
    // HANDLE NEW PATIENT INPUT
    // =========================================================

    const handleNewPatientChange = (e) => {

        const { name, value } = e.target;

        setNewPatient((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =========================================================
    // HANDLE APPOINTMENT INPUT
    // =========================================================

    const handleAppointmentChange = (e) => {

        const { name, value } = e.target;

        setAppointmentData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =========================================================
    // SEARCH EXISTING PATIENT
    // =========================================================

    const searchExistingPatient = async () => {

        setMessage("");
        setError("");
        setPatient(null);

        if (!existingPatientId.trim()) {

            setError(
                "Please enter Patient ID or UHID."
            );

            return;
        }

        try {

            setPatientLoading(true);

            const response = await api.get(
                `/receptionist/patient/uhid/${encodeURIComponent(
                    existingPatientId.trim()
                )}`
            );

            console.log(
                "Existing patient:",
                response.data
            );

            setPatient(response.data);

            setMessage(
                "Patient found successfully."
            );

        } catch (err) {

            console.error(
                "Patient search error:",
                err
            );

            setError(
                typeof err.response?.data === "string"
                    ? err.response.data
                    : "Patient not found."
            );

        } finally {

            setPatientLoading(false);
        }
    };

    // =========================================================
    // REGISTER NEW WALK-IN PATIENT
    // =========================================================

    const registerNewPatient = async () => {

        setMessage("");
        setError("");

        if (!newPatient.fullName.trim()) {

            setError(
                "Please enter patient name."
            );

            return;
        }

        if (!newPatient.mobile.trim()) {

            setError(
                "Please enter mobile number."
            );

            return;
        }

        if (!newPatient.email.trim()) {

            setError(
                "Please enter email."
            );

            return;
        }

        if (!newPatient.dateOfBirth) {

            setError(
                "Please select date of birth."
            );

            return;
        }

        if (!newPatient.gender) {

            setError(
                "Please select gender."
            );

            return;
        }

        try {

            setPatientLoading(true);

            const response = await api.post(
                "/receptionist/patient",
                {
                    fullName: newPatient.fullName,
                    mobile: newPatient.mobile,
                    email: newPatient.email,
                    dateOfBirth: newPatient.dateOfBirth,
                    gender: newPatient.gender
                }
            );

            console.log(
                "New patient registered:",
                response.data
            );

            setPatient(response.data);

            setMessage(
                `Patient registered successfully. Patient ID: ${response.data.id}, UHID: ${response.data.uhid}`
            );

        } catch (err) {

            console.error(
                "Patient registration error:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                typeof err.response?.data === "string"
                    ? err.response.data
                    : "Unable to register patient."
            );

        } finally {

            setPatientLoading(false);
        }
    };

    // =========================================================
    // LOAD DOCTORS BY SPECIALIZATION
    // =========================================================

    const handleSpecializationChange = async (e) => {

        const specialization = e.target.value;

        setSelectedSpecialization(
            specialization
        );

        setSelectedDoctorId("");
        setDoctors([]);
        setMessage("");
        setError("");

        if (!specialization) {
            return;
        }

        try {

            setDoctorLoading(true);

            const response = await api.get(
                `/doctor/specialization/${encodeURIComponent(
                    specialization
                )}`
            );

            console.log(
                "Doctors for specialization:",
                response.data
            );

            setDoctors(response.data || []);

            if (
                !response.data ||
                response.data.length === 0
            ) {

                setMessage(
                    "No doctors found for this specialization."
                );
            }

        } catch (err) {

            console.error(
                "Doctor loading error:",
                err
            );

            setError(
                typeof err.response?.data === "string"
                    ? err.response.data
                    : "Unable to load doctors."
            );

        } finally {

            setDoctorLoading(false);
        }
    };

    // =========================================================
    // CREATE APPOINTMENT
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if (!receptionistId) {

            setError(
                "Receptionist login information is missing. Please login again."
            );

            return;
        }

        // Patient must be selected/registered
        if (!patient || !patient.id) {

            setError(
                "Please search an existing patient or register a new patient first."
            );

            return;
        }

        // Doctor must be selected
        if (!selectedDoctorId) {

            setError(
                "Please select a doctor."
            );

            return;
        }

        if (!appointmentData.appointmentDate) {

            setError(
                "Please select appointment date."
            );

            return;
        }

        if (!appointmentData.appointmentTime) {

            setError(
                "Please select appointment time."
            );

            return;
        }

        try {

            setLoading(true);

            const data = {

                patient: {
                    id: Number(patient.id)
                },

                doctor: {
                    id: Number(selectedDoctorId)
                },

                appointmentDate:
                    appointmentData.appointmentDate,

                appointmentTime:
                    appointmentData.appointmentTime,

                reason:
                    appointmentData.reason,

                status: "PENDING"
            };

            console.log(
                "Creating walk-in appointment:",
                data
            );

            const response = await api.post(
                "/receptionist/appointment",
                data
            );

            console.log(
                "Walk-in appointment created:",
                response.data
            );

            setMessage(
                `Appointment created successfully. Appointment ID: ${response.data.appointmentId}`
            );

            // Reset appointment fields
            setSelectedSpecialization("");
            setDoctors([]);
            setSelectedDoctorId("");

            setAppointmentData({
                appointmentDate: "",
                appointmentTime: "",
                reason: ""
            });

        } catch (err) {

            console.error(
                "Walk-in appointment error:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                typeof err.response?.data === "string"
                    ? err.response.data
                    : "Unable to create walk-in appointment."
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // RESET PATIENT
    // =========================================================

    const resetPatient = () => {

        setPatient(null);
        setExistingPatientId("");

        setNewPatient({
            fullName: "",
            mobile: "",
            email: "",
            dateOfBirth: "",
            gender: ""
        });

        setSelectedSpecialization("");
        setDoctors([]);
        setSelectedDoctorId("");

        setAppointmentData({
            appointmentDate: "",
            appointmentTime: "",
            reason: ""
        });

        setMessage("");
        setError("");
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

            {/* =====================================================
                SIDEBAR
            ===================================================== */}

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
                            navigate("/receptionist")
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


                    <button className="active">
                        <span>🚶</span>
                        Walk-In
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/receptionist/admissions"
                            )
                        }
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


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="receptionist-main">

                <header className="receptionist-header">

                    <div>

                        <p className="receptionist-label">
                            WALK-IN MANAGEMENT
                        </p>

                        <h1>
                            Walk-In Patient
                        </h1>

                        <p>
                            Register new patients or book
                            appointments for existing patients.
                        </p>

                    </div>

                </header>


                {/* =================================================
                    FORM CARD
                ================================================= */}

                <section className="receptionist-form-card">

                    <div className="receptionist-form-heading">

                        <h2>
                            Walk-In Appointment
                        </h2>

                        <p>
                            Complete the patient details and
                            select the appropriate doctor.
                        </p>

                    </div>


                    {/* SUCCESS */}

                    {message && (

                        <div className="receptionist-success">

                            {message}

                        </div>

                    )}


                    {/* ERROR */}

                    {error && (

                        <div className="receptionist-error">

                            {error}

                        </div>

                    )}


                    {/* =================================================
                        PATIENT TYPE
                    ================================================= */}

                    <div className="receptionist-form-group">

                        <label>
                            Patient Type
                        </label>

                        <div
                            style={{
                                display: "flex",
                                gap: "25px",
                                marginTop: "8px"
                            }}
                        >

                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}
                            >

                                <input
                                    type="radio"
                                    name="patientType"
                                    value="EXISTING"
                                    checked={
                                        patientType === "EXISTING"
                                    }
                                    onChange={() => {
                                        setPatientType("EXISTING");
                                        resetPatient();
                                    }}
                                />

                                Existing Patient

                            </label>


                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}
                            >

                                <input
                                    type="radio"
                                    name="patientType"
                                    value="NEW"
                                    checked={
                                        patientType === "NEW"
                                    }
                                    onChange={() => {
                                        setPatientType("NEW");
                                        resetPatient();
                                    }}
                                />

                                New Patient

                            </label>

                        </div>

                    </div>


                    {/* =================================================
                        EXISTING PATIENT
                    ================================================= */}

                    {patientType === "EXISTING" && (

                        <>

                            <div className="receptionist-form-grid">

                                <div className="receptionist-form-group">

                                    <label>
                                        Patient ID / UHID
                                    </label>

                                    <input
                                        type="text"
                                        value={existingPatientId}
                                        onChange={(e) =>
                                            setExistingPatientId(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Example: 10001 or UHID10001"
                                    />

                                </div>


                                <div
                                    className="receptionist-form-group"
                                    style={{
                                        display: "flex",
                                        alignItems: "end"
                                    }}
                                >

                                    <button
                                        type="button"
                                        className="receptionist-primary-btn"
                                        onClick={
                                            searchExistingPatient
                                        }
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

                        </>

                    )}


                    {/* =================================================
                        NEW PATIENT
                    ================================================= */}

                    {patientType === "NEW" && (

                        <>

                            <h3
                                style={{
                                    marginTop: "25px",
                                    marginBottom: "15px"
                                }}
                            >
                                New Patient Registration
                            </h3>


                            <div className="receptionist-form-grid">

                                {/* FULL NAME */}

                                <div className="receptionist-form-group">

                                    <label>
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={
                                            newPatient.fullName
                                        }
                                        onChange={
                                            handleNewPatientChange
                                        }
                                        placeholder="Enter full name"
                                    />

                                </div>


                                {/* MOBILE */}

                                <div className="receptionist-form-group">

                                    <label>
                                        Mobile Number
                                    </label>

                                    <input
                                        type="text"
                                        name="mobile"
                                        value={
                                            newPatient.mobile
                                        }
                                        onChange={
                                            handleNewPatientChange
                                        }
                                        maxLength="10"
                                        placeholder="Enter mobile number"
                                    />

                                </div>


                                {/* EMAIL */}

                                <div className="receptionist-form-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            newPatient.email
                                        }
                                        onChange={
                                            handleNewPatientChange
                                        }
                                        placeholder="Enter email"
                                    />

                                </div>


                                {/* DOB */}

                                <div className="receptionist-form-group">

                                    <label>
                                        Date of Birth
                                    </label>

                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={
                                            newPatient.dateOfBirth
                                        }
                                        onChange={
                                            handleNewPatientChange
                                        }
                                    />

                                </div>


                                {/* GENDER */}

                                <div className="receptionist-form-group">

                                    <label>
                                        Gender
                                    </label>

                                    <select
                                        name="gender"
                                        value={
                                            newPatient.gender
                                        }
                                        onChange={
                                            handleNewPatientChange
                                        }
                                    >

                                        <option value="">
                                            Select Gender
                                        </option>

                                        <option value="MALE">
                                            Male
                                        </option>

                                        <option value="FEMALE">
                                            Female
                                        </option>

                                        <option value="OTHER">
                                            Other
                                        </option>

                                    </select>

                                </div>

                            </div>


                            <div
                                className="receptionist-form-actions"
                                style={{
                                    justifyContent: "flex-start"
                                }}
                            >

                                <button
                                    type="button"
                                    className="receptionist-primary-btn"
                                    onClick={
                                        registerNewPatient
                                    }
                                    disabled={
                                        patientLoading
                                    }
                                >

                                    {patientLoading
                                        ? "Registering..."
                                        : "Register Patient"}

                                </button>

                            </div>

                        </>

                    )}


                    {/* =================================================
                        PATIENT DETAILS
                    ================================================= */}

                    {patient && (

                        <div
                            style={{
                                marginTop: "25px",
                                padding: "18px",
                                border: "1px solid #ddd",
                                borderRadius: "10px"
                            }}
                        >

                            <h3>
                                Patient Details
                            </h3>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(3, 1fr)",
                                    gap: "15px",
                                    marginTop: "12px"
                                }}
                            >

                                <div>
                                    <strong>
                                        Patient ID
                                    </strong>

                                    <p>
                                        {patient.id}
                                    </p>
                                </div>


                                <div>
                                    <strong>
                                        UHID
                                    </strong>

                                    <p>
                                        {patient.uhid}
                                    </p>
                                </div>


                                <div>
                                    <strong>
                                        Name
                                    </strong>

                                    <p>
                                        {patient.fullName}
                                    </p>
                                </div>


                                <div>
                                    <strong>
                                        Mobile
                                    </strong>

                                    <p>
                                        {patient.mobile}
                                    </p>
                                </div>


                                <div>
                                    <strong>
                                        Email
                                    </strong>

                                    <p>
                                        {patient.email}
                                    </p>
                                </div>


                                <div>
                                    <strong>
                                        Gender
                                    </strong>

                                    <p>
                                        {patient.gender}
                                    </p>
                                </div>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        DOCTOR SELECTION
                    ================================================= */}

                    {patient && (

                        <>

                            <h3
                                style={{
                                    marginTop: "30px",
                                    marginBottom: "15px"
                                }}
                            >
                                Select Doctor
                            </h3>


                            <div className="receptionist-form-grid">

                                {/* SPECIALIZATION */}

                                <div className="receptionist-form-group">

                                    <label>
                                        Department / Specialization
                                    </label>

                                    <select
                                        value={
                                            selectedSpecialization
                                        }
                                        onChange={
                                            handleSpecializationChange
                                        }
                                    >

                                        <option value="">
                                            Select Specialization
                                        </option>

                                        {specializations.map(
                                            (specialization, index) => {

                                                const value =
                                                    typeof specialization ===
                                                    "string"
                                                        ? specialization
                                                        : specialization.specialization;

                                                return (
                                                    <option
                                                        key={index}
                                                        value={value}
                                                    >
                                                        {value}
                                                    </option>
                                                );
                                            }
                                        )}

                                    </select>

                                </div>


                                {/* DOCTOR */}

                                <div className="receptionist-form-group">

                                    <label>
                                        Available Doctor
                                    </label>

                                    <select
                                        value={
                                            selectedDoctorId
                                        }
                                        onChange={(e) =>
                                            setSelectedDoctorId(
                                                e.target.value
                                            )
                                        }
                                        disabled={
                                            !selectedSpecialization ||
                                            doctorLoading ||
                                            doctors.length === 0
                                        }
                                    >

                                        <option value="">
                                            {doctorLoading
                                                ? "Loading doctors..."
                                                : !selectedSpecialization
                                                    ? "Select specialization first"
                                                    : doctors.length === 0
                                                        ? "No doctors available"
                                                        : "Select Doctor"}
                                        </option>

                                        {doctors.map(
                                            (doctor) => (

                                                <option
                                                    key={doctor.id}
                                                    value={doctor.id}
                                                >
                                                    {doctor.fullName}
                                                    {doctor.qualification
                                                        ? ` - ${doctor.qualification}`
                                                        : ""}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </div>

                        </>

                    )}


                    {/* =================================================
                        APPOINTMENT DETAILS
                    ================================================= */}

                    {patient && selectedDoctorId && (

                        <>

                            <h3
                                style={{
                                    marginTop: "30px",
                                    marginBottom: "15px"
                                }}
                            >
                                Appointment Details
                            </h3>


                            <div className="receptionist-form-grid">

                                {/* DATE */}

                                <div className="receptionist-form-group">

                                    <label>
                                        Appointment Date
                                    </label>

                                    <input
                                        type="date"
                                        name="appointmentDate"
                                        min={today}
                                        value={
                                            appointmentData.appointmentDate
                                        }
                                        onChange={
                                            handleAppointmentChange
                                        }
                                        required
                                    />

                                </div>


                                {/* TIME */}

                                <div className="receptionist-form-group">

                                    <label>
                                        Appointment Time
                                    </label>

                                    <input
                                        type="time"
                                        name="appointmentTime"
                                        value={
                                            appointmentData.appointmentTime
                                        }
                                        onChange={
                                            handleAppointmentChange
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            {/* REASON */}

                            <div
                                className="receptionist-form-group full"
                                style={{
                                    marginTop: "15px"
                                }}
                            >

                                <label>
                                    Reason / Complaint
                                </label>

                                <textarea
                                    name="reason"
                                    value={
                                        appointmentData.reason
                                    }
                                    onChange={
                                        handleAppointmentChange
                                    }
                                    rows="5"
                                    placeholder="Enter reason for visit..."
                                />

                            </div>


                            {/* BUTTONS */}

                            <div className="receptionist-form-actions">

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
                                    type="button"
                                    className="receptionist-primary-btn"
                                    onClick={
                                        handleSubmit
                                    }
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Creating..."
                                        : "Create Appointment"}

                                </button>

                            </div>

                        </>

                    )}

                </section>

            </main>

        </div>
    );
};

export default WalkIn;