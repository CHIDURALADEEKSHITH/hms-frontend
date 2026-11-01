import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./receptionist.css";

const Billing = () => {

    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    // =========================================================
    // USER
    // =========================================================

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const receptionistId = user.userId;

    // =========================================================
    // PATIENT
    // =========================================================

    const [patientSearch, setPatientSearch] = useState("");

    const [patient, setPatient] = useState(null);

    const [searchingPatient, setSearchingPatient] =
        useState(false);

    // =========================================================
    // APPOINTMENTS
    // =========================================================

    const [appointments, setAppointments] = useState([]);

    const [selectedAppointment, setSelectedAppointment] =
        useState(null);

    const [loadingAppointments, setLoadingAppointments] =
        useState(false);

    // =========================================================
    // LAB TESTS
    // =========================================================

    const [labTests, setLabTests] = useState([]);

    const [loadingLabs, setLoadingLabs] =
        useState(false);

    // =========================================================
    // ADMISSIONS
    // =========================================================

    const [admissions, setAdmissions] = useState([]);

    const [selectedAdmission, setSelectedAdmission] =
        useState(null);

    const [loadingAdmissions, setLoadingAdmissions] =
        useState(false);

    // =========================================================
    // BILL CHARGES
    // =========================================================

    const [charges, setCharges] = useState({

        registrationCharges: "",

        consultationCharges: "",

        laboratoryCharges: "",

        admissionCharges: "",

        roomCharges: "",

        otherCharges: ""

    });

    const [description, setDescription] =
        useState("");

    const [paymentMethod, setPaymentMethod] =
        useState("CASH");

    // =========================================================
    // STATUS
    // =========================================================

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    // =========================================================
    // TOTAL
    // =========================================================

    const totalAmount =
        Number(charges.registrationCharges || 0) +
        Number(charges.consultationCharges || 0) +
        Number(charges.laboratoryCharges || 0) +
        Number(charges.admissionCharges || 0) +
        Number(charges.roomCharges || 0) +
        Number(charges.otherCharges || 0);

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

            setSearchingPatient(true);

            let response;

            const value =
                patientSearch.trim();

            // -------------------------------------------------
            // Patient ID
            // -------------------------------------------------

            if (/^\d+$/.test(value)) {

                /*
                 * There is no direct patient-id endpoint.
                 * We therefore search by UHID if it starts
                 * with UHID, otherwise use all appointments
                 * and find patient.
                 */

                response = await api.get(
                    `/receptionist/patient/uhid/UHID${value}`
                );

            } else {

                response = await api.get(
                    `/receptionist/patient/uhid/${value}`
                );

            }

            const foundPatient =
                response.data;

            if (!foundPatient) {

                setError(
                    "Patient not found."
                );

                setPatient(null);
                setAppointments([]);
                setSelectedAppointment(null);
                setLabTests([]);
                setAdmissions([]);

                return;
            }

            setPatient(foundPatient);

            // Load appointments
            await loadPatientAppointments(
                foundPatient.id
            );

        } catch (err) {

            console.error(
                "Patient search failed:",
                err
            );

            /*
             * If UHID search fails, try mobile.
             */

            try {

                const mobileResponse =
                    await api.get(
                        `/receptionist/patient/mobile/${patientSearch.trim()}`
                    );

                const foundPatient =
                    mobileResponse.data;

                setPatient(foundPatient);

                await loadPatientAppointments(
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
                setLabTests([]);
                setAdmissions([]);

                setError(
                    "Patient not found. Please enter a valid Patient ID or UHID."
                );
            }

        } finally {

            setSearchingPatient(false);

        }
    };

    // =========================================================
    // LOAD PATIENT APPOINTMENTS
    // =========================================================

    const loadPatientAppointments = async (
        patientId
    ) => {

        try {

            setLoadingAppointments(true);

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
                        ) === Number(patientId)
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
                "Unable to load patient appointments."
            );

        } finally {

            setLoadingAppointments(false);

        }
    };

    // =========================================================
    // SELECT APPOINTMENT
    // =========================================================

    const selectAppointment = async (
        appointment
    ) => {

        console.log("Selected appointment:", appointment);

        setMessage("");
        setError("");

        setSelectedAppointment(
            appointment
        );

        setSelectedAdmission(null);

        // Reset previous data
        setLabTests([]);
        setAdmissions([]);

        // -----------------------------------------------------
        // LOAD LAB TESTS
        // -----------------------------------------------------

        try {

            setLoadingLabs(true);

            const labResponse =
                await api.get(
                    `/lab/patient/${patient.id}/tests`
                );

            const allLabTests =
                labResponse.data || [];

            /*
             * IMPORTANT:
             * Only tests belonging to the
             * selected appointment.
             */

            const appointmentLabs =
                allLabTests.filter(
                    (test) =>
                        Number(
                            test.appointment?.id
                        ) ===
                        Number(
                            appointment.id
                        )
                );

            setLabTests(
                appointmentLabs
            );

        } catch (err) {

            console.error(
                "Unable to load lab tests:",
                err
            );

            setLabTests([]);

        } finally {

            setLoadingLabs(false);

        }

        // -----------------------------------------------------
        // LOAD ADMISSIONS
        // -----------------------------------------------------

        try {

            setLoadingAdmissions(true);

            const admissionResponse =
                await api.get(
                    `/receptionist/patient/${patient.id}/admissions`
                );

            const allAdmissions =
                admissionResponse.data || [];

            /*
             * IMPORTANT:
             *
             * Admission is now connected directly
             * with Appointment.
             *
             * Therefore we DO NOT filter by doctor.
             * We filter by appointment ID.
             */

            const appointmentAdmissions =
                allAdmissions.filter(
                    (admission) =>
                        Number(
                            admission.appointment?.id
                        ) ===
                        Number(
                            appointment.id
                        )
                );

            setAdmissions(
                appointmentAdmissions
            );

            /*
             * If there is only one admission,
             * automatically select it.
             */

            if (
                appointmentAdmissions.length === 1
            ) {

                setSelectedAdmission(
                    appointmentAdmissions[0]
                );

            }

        } catch (err) {

            console.error(
                "Unable to load admissions:",
                err
            );

            setAdmissions([]);

        } finally {

            setLoadingAdmissions(false);

        }
    };

    // =========================================================
    // CHARGE CHANGE
    // =========================================================

    const handleChargeChange = (
        e
    ) => {

        const {
            name,
            value
        } = e.target;

        setCharges(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );
    };

    // =========================================================
    // CREATE BILL + PAYMENT
    // =========================================================

    const handleSubmit = async (
        e
    ) => {

        e.preventDefault();

        setMessage("");
        setError("");

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!receptionistId) {

            setError(
                "Receptionist login information is missing. Please login again."
            );

            return;
        }

        if (!patient) {

            setError(
                "Please search and select a patient."
            );

            return;
        }

        if (!selectedAppointment) {

            setError(
                "Please select an appointment."
            );

            return;
        }

        if (totalAmount <= 0) {

            setError(
                "Please enter at least one billing charge."
            );

            return;
        }

        try {

            setSaving(true);

            // -------------------------------------------------
            // BILL DATA
            // -------------------------------------------------

            const billData = {

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

                admission:
                    selectedAdmission
                        ? {
                              id: Number(
                                  selectedAdmission.id
                              )
                          }
                        : null,

                description:
                    description,

                registrationCharges:
                    Number(
                        charges.registrationCharges ||
                        0
                    ),

                consultationCharges:
                    Number(
                        charges.consultationCharges ||
                        0
                    ),

                laboratoryCharges:
                    Number(
                        charges.laboratoryCharges ||
                        0
                    ),

                admissionCharges:
                    Number(
                        charges.admissionCharges ||
                        0
                    ),

                roomCharges:
                    Number(
                        charges.roomCharges ||
                        0
                    ),

                otherCharges:
                    Number(
                        charges.otherCharges ||
                        0
                    )
            };

            console.log(
                "Creating hospital bill:",
                billData
            );

            // -------------------------------------------------
            // CREATE BILL
            // -------------------------------------------------

            const billResponse =
                await api.post(
                    "/receptionist/billing",
                    billData
                );

            const createdBill =
                billResponse.data;

            console.log(
                "Hospital bill created:",
                createdBill
            );

            // -------------------------------------------------
            // COMPLETE PAYMENT
            // -------------------------------------------------

            if (
                createdBill?.id
            ) {

                await api.put(
                    `/receptionist/billing/${createdBill.id}/payment`
                );

            }

            setMessage(
                `Bill ${
                    createdBill?.billNumber ||
                    ""
                } generated and payment completed successfully by ${paymentMethod}.`
            );

            // -------------------------------------------------
            // RESET CHARGES
            // -------------------------------------------------

            setCharges({

                registrationCharges: "",

                consultationCharges: "",

                laboratoryCharges: "",

                admissionCharges: "",

                roomCharges: "",

                otherCharges: ""

            });

            setDescription("");

            setPaymentMethod(
                "CASH"
            );

        } catch (err) {

            console.error(
                "Billing failed:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            const backendMessage =
                err.response?.data;

            if (
                typeof backendMessage ===
                "string"
            ) {

                setError(
                    backendMessage
                );

            } else {

                setError(
                    "Unable to create bill or complete payment."
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
                        className="active"
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

                {/* HEADER */}

                <header className="receptionist-header">

                    <div>

                        <p className="receptionist-label">
                            HOSPITAL BILLING
                        </p>

                        <h1>
                            Patient Billing
                        </h1>

                        <p>
                            Select a patient and appointment
                            to generate the hospital bill.
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
                    1. PATIENT SEARCH
                ================================================= */}

                <section className="receptionist-form-card">

                    <div className="receptionist-form-heading">

                        <h2>
                            1. Search Patient
                        </h2>

                        <p>
                            Search using Patient ID or UHID.
                        </p>

                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "end"
                        }}
                    >

                        <div
                            className="receptionist-form-group"
                            style={{
                                flex: 1
                            }}
                        >

                            <label>
                                Patient ID / UHID
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
                                placeholder="Example: 10001 or UHID10001"
                                onKeyDown={(e) => {

                                    if (
                                        e.key ===
                                        "Enter"
                                    ) {

                                        searchPatient();

                                    }

                                }}
                            />

                        </div>

                        <button
                            type="button"
                            className="receptionist-primary-btn"
                            onClick={
                                searchPatient
                            }
                            disabled={
                                searchingPatient
                            }
                        >

                            {searchingPatient
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

                            <p>
                                Patient information
                            </p>

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

                            <div className="receptionist-form-group">

                                <label>
                                    Email
                                </label>

                                <input
                                    value={
                                        patient.email ||
                                        ""
                                    }
                                    readOnly
                                />

                            </div>

                            <div className="receptionist-form-group">

                                <label>
                                    Gender
                                </label>

                                <input
                                    value={
                                        patient.gender ||
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
                                    2. Patient Appointments
                                </h2>

                                <p>
                                    Select one appointment
                                    for billing.
                                </p>

                            </div>

                        </div>

                        {loadingAppointments ? (

                            <div className="receptionist-empty">

                                Loading appointments...

                            </div>

                        ) : appointments.length === 0 ? (

                            <div className="receptionist-empty">

                                No appointments found
                                for this patient.

                            </div>

                        ) : (

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px"
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
                                                            : "#ffffff",
                                                    borderRadius:
                                                        "10px",
                                                    padding:
                                                        "14px 18px",
                                                    cursor:
                                                        "pointer"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems:
                                                            "center"
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
                                                                appointment.appointmentDate ||
                                                                "-"
                                                            }
                                                        </div>

                                                    </div>

                                                    <div>

                                                        <small>
                                                            Time
                                                        </small>

                                                        <div>
                                                            {
                                                                appointment.appointmentTime ||
                                                                "-"
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
                    SELECTED APPOINTMENT
                ================================================= */}

                {selectedAppointment && (

                    <>

                        {/* =================================================
                            3. APPOINTMENT DETAILS
                        ================================================= */}

                        <section className="receptionist-form-card">

                            <div className="receptionist-form-heading">

                                <h2>
                                    3. Selected Appointment
                                </h2>

                                <p>
                                    Billing is being prepared
                                    for this appointment.
                                </p>

                            </div>

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
                                        Date
                                    </label>

                                    <input
                                        value={
                                            selectedAppointment
                                                .appointmentDate ||
                                            ""
                                        }
                                        readOnly
                                    />

                                </div>

                                <div className="receptionist-form-group">

                                    <label>
                                        Time
                                    </label>

                                    <input
                                        value={
                                            selectedAppointment
                                                .appointmentTime ||
                                            ""
                                        }
                                        readOnly
                                    />

                                </div>

                                <div className="receptionist-form-group full">

                                    <label>
                                        Reason
                                    </label>

                                    <input
                                        value={
                                            selectedAppointment
                                                .reason ||
                                            ""
                                        }
                                        readOnly
                                    />

                                </div>

                            </div>

                        </section>

                        {/* =================================================
                            4. LAB TESTS
                        ================================================= */}

                        <section className="receptionist-section">

                            <div className="receptionist-section-heading">

                                <div>

                                    <h2>
                                        4. Laboratory Tests
                                    </h2>

                                    <p>
                                        Only tests ordered
                                        for the selected
                                        appointment.
                                    </p>

                                </div>

                            </div>

                            {loadingLabs ? (

                                <div className="receptionist-empty">
                                    Loading laboratory tests...
                                </div>

                            ) : labTests.length === 0 ? (

                                <div className="receptionist-empty">
                                    No laboratory tests
                                    were ordered for this
                                    appointment.
                                </div>

                            ) : (

                                <div
                                    className="receptionist-table-wrapper"
                                >

                                    <table
                                        className="receptionist-table"
                                    >

                                        <thead>

                                            <tr>

                                                <th>
                                                    Test
                                                </th>

                                                <th>
                                                    Category
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Result
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {labTests.map(
                                                (test) => (

                                                    <tr
                                                        key={
                                                            test.id
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                test.testName
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                test.testCategory
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                test.status
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                test.result ||
                                                                "Not available"
                                                            }
                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </section>

                        {/* =================================================
                            5. ADMISSION
                        ================================================= */}

                        <section className="receptionist-section">

                            <div className="receptionist-section-heading">

                                <div>

                                    <h2>
                                        5. Admission Details
                                    </h2>

                                    <p>
                                        Only admission related
                                        to the selected
                                        appointment.
                                    </p>

                                </div>

                            </div>

                            {loadingAdmissions ? (

                                <div className="receptionist-empty">
                                    Loading admission details...
                                </div>

                            ) : admissions.length === 0 ? (

                                <div className="receptionist-empty">

                                    No admission is linked
                                    to this appointment.

                                </div>

                            ) : (

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        flexDirection:
                                            "column",
                                        gap:
                                            "12px"
                                    }}
                                >

                                    {admissions.map(
                                        (admission) => {

                                            const selected =
                                                selectedAdmission?.id ===
                                                admission.id;

                                            return (

                                                <button
                                                    key={
                                                        admission.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedAdmission(
                                                            admission
                                                        )
                                                    }
                                                    style={{
                                                        textAlign:
                                                            "left",
                                                        width:
                                                            "100%",
                                                        border:
                                                            selected
                                                                ? "2px solid #14b8a6"
                                                                : "1px solid #dce5e9",
                                                        background:
                                                            selected
                                                                ? "#effcf9"
                                                                : "#ffffff",
                                                        borderRadius:
                                                            "10px",
                                                        padding:
                                                            "18px",
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
                                                            Admission #
                                                            {
                                                                admission.id
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                admission.status
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
                                                                "14px"
                                                        }}
                                                    >

                                                        <div>

                                                            <small>
                                                                Doctor
                                                            </small>

                                                            <div>
                                                                {
                                                                    admission
                                                                        .doctor
                                                                        ?.fullName ||
                                                                    "N/A"
                                                                }
                                                            </div>

                                                        </div>

                                                        <div>

                                                            <small>
                                                                Admission Date
                                                            </small>

                                                            <div>
                                                                {
                                                                    admission
                                                                        .admissionDate ||
                                                                    "-"
                                                                }
                                                            </div>

                                                        </div>

                                                        <div>

                                                            <small>
                                                                Bed
                                                            </small>

                                                            <div>
                                                                {
                                                                    admission
                                                                        .bed
                                                                        ?.bedNumber ||
                                                                    admission
                                                                        .bed
                                                                        ?.bedName ||
                                                                    "Not assigned"
                                                                }
                                                            </div>

                                                        </div>

                                                        <div>

                                                            <small>
                                                                Ward
                                                            </small>

                                                            <div>
                                                                {
                                                                    admission
                                                                        .bed
                                                                        ?.wardName ||
                                                                    admission
                                                                        .bed
                                                                        ?.ward ||
                                                                    "Not assigned"
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

                        {/* =================================================
                            6. CHARGES
                        ================================================= */}

                        <section className="receptionist-form-card">

                            <div className="receptionist-form-heading">

                                <h2>
                                    6. Billing Charges
                                </h2>

                                <p>
                                    Enter the charges for
                                    this appointment.
                                </p>

                            </div>

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >

                                <div
                                    className="receptionist-form-grid"
                                >

                                    {/* REGISTRATION */}

                                    <div className="receptionist-form-group">

                                        <label>
                                            Registration Charges (₹)
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="registrationCharges"
                                            value={
                                                charges.registrationCharges
                                            }
                                            onChange={
                                                handleChargeChange
                                            }
                                            placeholder="0"
                                        />

                                    </div>

                                    {/* CONSULTATION */}

                                    <div className="receptionist-form-group">

                                        <label>
                                            Consultation Charges (₹)
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="consultationCharges"
                                            value={
                                                charges.consultationCharges
                                            }
                                            onChange={
                                                handleChargeChange
                                            }
                                            placeholder="0"
                                        />

                                    </div>

                                    {/* LAB */}

                                    <div className="receptionist-form-group">

                                        <label>
                                            Laboratory Charges (₹)
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="laboratoryCharges"
                                            value={
                                                charges.laboratoryCharges
                                            }
                                            onChange={
                                                handleChargeChange
                                            }
                                            placeholder="0"
                                        />

                                    </div>

                                    {/* ADMISSION */}

                                    <div className="receptionist-form-group">

                                        <label>
                                            Admission Charges (₹)
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="admissionCharges"
                                            value={
                                                charges.admissionCharges
                                            }
                                            onChange={
                                                handleChargeChange
                                            }
                                            placeholder="0"
                                            disabled={
                                                !selectedAdmission
                                            }
                                        />

                                    </div>

                                    {/* ROOM */}

                                    <div className="receptionist-form-group">

                                        <label>
                                            Room / Bed Charges (₹)
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="roomCharges"
                                            value={
                                                charges.roomCharges
                                            }
                                            onChange={
                                                handleChargeChange
                                            }
                                            placeholder="0"
                                            disabled={
                                                !selectedAdmission
                                            }
                                        />

                                    </div>

                                    {/* OTHER */}

                                    <div className="receptionist-form-group">

                                        <label>
                                            Other Charges (₹)
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="otherCharges"
                                            value={
                                                charges.otherCharges
                                            }
                                            onChange={
                                                handleChargeChange
                                            }
                                            placeholder="0"
                                        />

                                    </div>

                                </div>

                                {/* DESCRIPTION */}

                                <div
                                    className="receptionist-form-group full"
                                >

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        rows="3"
                                        value={
                                            description
                                        }
                                        onChange={(e) =>
                                            setDescription(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter billing description..."
                                    />

                                </div>

                                {/* PAYMENT */}

                                <div
                                    className="receptionist-form-grid"
                                >

                                    <div className="receptionist-form-group">

                                        <label>
                                            Payment Method
                                        </label>

                                        <select
                                            value={
                                                paymentMethod
                                            }
                                            onChange={(e) =>
                                                setPaymentMethod(
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="CASH">
                                                Cash
                                            </option>

                                            <option value="UPI">
                                                UPI
                                            </option>

                                            <option value="CARD">
                                                Card
                                            </option>

                                            <option value="ONLINE">
                                                Online
                                            </option>

                                        </select>

                                    </div>

                                </div>

                                {/* TOTAL */}

                                <div
                                    style={{
                                        marginTop:
                                            "25px",
                                        padding:
                                            "20px",
                                        background:
                                            "#f1f8f7",
                                        borderRadius:
                                            "10px",
                                        display:
                                            "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center"
                                    }}
                                >

                                    <strong>
                                        Total Bill Amount
                                    </strong>

                                    <strong
                                        style={{
                                            fontSize:
                                                "24px"
                                        }}
                                    >
                                        ₹
                                        {
                                            totalAmount.toFixed(
                                                2
                                            )
                                        }
                                    </strong>

                                </div>

                                {/* BUTTONS */}

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
                                            ? "Processing..."
                                            : "Generate Bill & Complete Payment"}

                                    </button>

                                </div>

                            </form>

                        </section>

                    </>

                )}

            </main>

        </div>

    );
};

export default Billing;