import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./pharmacist.css";

const PharmacyBilling = () => {
    const { logout } = useAuth();

    // =========================================================
    // FORM STATES
    // =========================================================

    const [patientId, setPatientId] = useState("");

    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] =
        useState(null);

    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedPrescription, setSelectedPrescription] =
        useState(null);

    const [pricePerTablet, setPricePerTablet] =
        useState("");

    const [quantity, setQuantity] =
        useState("");

    const [bills, setBills] =
        useState([]);

    const [loadingAppointments, setLoadingAppointments] =
        useState(false);

    const [loadingPrescription, setLoadingPrescription] =
        useState(false);

    const [loadingBills, setLoadingBills] =
        useState(false);

    const [creatingBill, setCreatingBill] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    // =========================================================
    // FIND PATIENT APPOINTMENTS
    // =========================================================

    const findAppointments = async () => {

        if (!patientId) {
            setError("Please enter Patient ID.");
            return;
        }

        setError("");
        setMessage("");

        setAppointments([]);
        setSelectedAppointment(null);
        setPrescriptions([]);
        setSelectedPrescription(null);

        try {

            setLoadingAppointments(true);

            const response = await api.get(
                `/pharmacist/patient/${patientId}/appointments`
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setAppointments(data);

            if (data.length === 0) {
                setError(
                    "No appointments found for this patient."
                );
            }

        } catch (err) {

            console.error(
                "Unable to load appointments:",
                err
            );

            setError(
                err.response?.data ||
                "Unable to load patient appointments."
            );

        } finally {

            setLoadingAppointments(false);

        }
    };


    // =========================================================
    // SELECT APPOINTMENT
    // =========================================================

    const handleAppointmentSelect = async (appointmentId) => {

        if (!appointmentId) {

            setSelectedAppointment(null);
            setPrescriptions([]);
            setSelectedPrescription(null);

            return;
        }

        const appointment =
            appointments.find(
                (item) =>
                    String(item.id) ===
                    String(appointmentId)
            );

        setSelectedAppointment(appointment || null);

        setPrescriptions([]);
        setSelectedPrescription(null);

        setPricePerTablet("");
        setQuantity("");

        setError("");
        setMessage("");

        try {

            setLoadingPrescription(true);

            const response = await api.get(
                `/pharmacist/appointment/${appointmentId}/prescriptions`
            );

            const data = Array.isArray(response.data)
                ? response.data
                : [];

            setPrescriptions(data);

            if (data.length === 0) {

                setError(
                    "No prescription found for this appointment."
                );

            }

        } catch (err) {

            console.error(
                "Unable to load prescription:",
                err
            );

            setError(
                err.response?.data ||
                "Unable to load doctor's prescription."
            );

        } finally {

            setLoadingPrescription(false);

        }
    };


    // =========================================================
    // SELECT PRESCRIPTION
    // =========================================================

    const handlePrescriptionSelect = (prescription) => {

        setSelectedPrescription(prescription);

        setPricePerTablet("");
        setQuantity("");

        setError("");
        setMessage("");
    };


    // =========================================================
    // TOTAL
    // =========================================================

    const totalAmount =
        Number(pricePerTablet || 0) *
        Number(quantity || 0);


    // =========================================================
    // CREATE PHARMACY BILL
    // =========================================================

    const createBill = async () => {

        if (!patientId) {
            setError("Patient ID is required.");
            return;
        }

        if (!selectedAppointment) {
            setError("Please select an appointment.");
            return;
        }

        if (!selectedPrescription) {
            setError("Please select a prescription.");
            return;
        }

        if (
            !pricePerTablet ||
            Number(pricePerTablet) <= 0
        ) {
            setError(
                "Please enter a valid price per tablet."
            );
            return;
        }

        if (
            !quantity ||
            Number(quantity) <= 0
        ) {
            setError(
                "Please enter a valid quantity."
            );
            return;
        }

        setError("");
        setMessage("");

        try {

            setCreatingBill(true);

            const billData = {

                patient: {
                    id: Number(patientId)
                },

                prescription: {
                    id: selectedPrescription.id
                },

                medicineName:
                    selectedPrescription.medicine || "",

                pricePerTablet:
                    Number(pricePerTablet),

                quantity:
                    Number(quantity)

            };

            console.log(
                "CREATING PHARMACY BILL:",
                billData
            );

            const response = await api.post(
                "/pharmacist/bill",
                billData
            );

            setMessage(
                `Bill ${response.data?.billNumber || ""} created successfully.`
            );

            setBills((previous) => [
                response.data,
                ...previous
            ]);

            // Keep selected prescription,
            // but clear price and quantity
            setPricePerTablet("");
            setQuantity("");

        } catch (err) {

            console.error(
                "Create pharmacy bill error:",
                err
            );

            setError(
                err.response?.data ||
                "Unable to create pharmacy bill."
            );

        } finally {

            setCreatingBill(false);

        }
    };


    // =========================================================
    // LOAD PATIENT BILLS
    // =========================================================

    const loadPatientBills = async () => {

        if (!patientId) {
            setError("Please enter Patient ID first.");
            return;
        }

        try {

            setLoadingBills(true);
            setError("");

            const response = await api.get(
                `/pharmacist/patient/${patientId}/bills`
            );

            setBills(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Unable to load bills:",
                err
            );

            setError(
                err.response?.data ||
                "Unable to load pharmacy bills."
            );

        } finally {

            setLoadingBills(false);

        }
    };


    // =========================================================
    // HELPER FUNCTIONS
    // =========================================================

    const getAppointmentDisplayId = (appointment) => {

        return (
            appointment?.appointmentId ||
            `Appointment #${appointment?.id || "-"}`
        );

    };


    const getPatientName = () => {

        if (selectedAppointment?.patient?.fullName) {
            return selectedAppointment.patient.fullName;
        }

        if (selectedPrescription?.patient?.fullName) {
            return selectedPrescription.patient.fullName;
        }

        return "Patient";

    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="pharmacist-page">

            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside className="pharmacist-sidebar">

                <div className="pharmacist-logo">

                    <div className="pharmacist-logo-icon">
                        +
                    </div>

                    <div>
                        <h2>Thilak Hospital</h2>
                        <span>Pharmacy Portal</span>
                    </div>

                </div>


                <nav className="pharmacist-nav">

                    <button
                        onClick={() =>
                            window.location.href =
                                "/pharmacist"
                        }
                    >
                        <span>▣</span>
                        Dashboard
                    </button>


                    <button
                        onClick={() =>
                            window.location.href =
                                "/pharmacist/prescriptions"
                        }
                    >
                        <span>💊</span>
                        Prescription Requests
                    </button>


                    <button className="active">
                        <span>🧾</span>
                        Pharmacy Billing
                    </button>


                    <button
                        onClick={() =>
                            window.location.href =
                                "/pharmacist/dispensing"
                        }
                    >
                        <span>💉</span>
                        Dispensing
                    </button>

                </nav>


                <button
                    className="pharmacist-logout"
                    onClick={() => {
                        logout();
                        window.location.href = "/";
                    }}
                >
                    ⇥ Logout
                </button>

            </aside>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="pharmacist-main">

                {/* HEADER */}

                <header className="pharmacist-header">

                    <div>

                        <p className="pharmacist-label">
                            PHARMACY BILLING
                        </p>

                        <h1>
                            Pharmacy Billing
                        </h1>

                        <p>
                            Create pharmacy bills from doctor's prescriptions.
                        </p>

                    </div>

                </header>


                {/* =================================================
                    PATIENT SEARCH
                ================================================= */}

                <section className="pharmacist-section">

                    <div className="pharmacist-section-heading">

                        <div>

                            <h2>
                                1. Find Patient
                            </h2>

                            <p>
                                Enter the patient's ID to view appointments.
                            </p>

                        </div>

                    </div>


                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "end"
                        }}
                    >

                        <div
                            style={{
                                flex: 1
                            }}
                        >

                            <label>
                                Patient ID
                            </label>

                            <input
                                type="number"
                                value={patientId}
                                onChange={(e) =>
                                    setPatientId(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter Patient ID"
                            />

                        </div>


                        <button
                            className="pharmacist-primary-btn"
                            onClick={
                                findAppointments
                            }
                            disabled={
                                loadingAppointments
                            }
                        >
                            {loadingAppointments
                                ? "Loading..."
                                : "Find Appointments"}
                        </button>

                    </div>

                </section>


                {/* =================================================
                    APPOINTMENTS
                ================================================= */}

                {appointments.length > 0 && (

                    <section className="pharmacist-section">

                        <div className="pharmacist-section-heading">

                            <div>

                                <h2>
                                    2. Select Appointment
                                </h2>

                                <p>
                                    Select the patient's appointment.
                                </p>

                            </div>

                        </div>


                        <select
                            value={
                                selectedAppointment?.id ||
                                ""
                            }
                            onChange={(e) =>
                                handleAppointmentSelect(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                Select Appointment
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

                                        {
                                            getAppointmentDisplayId(
                                                appointment
                                            )
                                        }

                                        {" — "}

                                        {
                                            appointment.appointmentDate ||
                                            "-"
                                        }

                                        {" "}

                                        {
                                            appointment.appointmentTime ||
                                            ""
                                        }

                                    </option>

                                )
                            )}

                        </select>

                    </section>

                )}


                {/* =================================================
                    PRESCRIPTION
                ================================================= */}

                {selectedAppointment && (

                    <section className="pharmacist-section">

                        <div className="pharmacist-section-heading">

                            <div>

                                <h2>
                                    3. Doctor's Prescription
                                </h2>

                                <p>
                                    Medicines prescribed for the selected appointment.
                                </p>

                            </div>

                        </div>


                        {loadingPrescription ? (

                            <div className="pharmacist-empty">
                                Loading doctor's prescription...
                            </div>

                        ) : prescriptions.length === 0 ? (

                            <div className="pharmacist-empty">
                                No prescription found for this appointment.
                            </div>

                        ) : (

                            <div>

                                {prescriptions.map(
                                    (prescription) => (

                                        <div
                                            key={
                                                prescription.id
                                            }
                                            onClick={() =>
                                                handlePrescriptionSelect(
                                                    prescription
                                                )
                                            }
                                            style={{
                                                border:
                                                    selectedPrescription?.id ===
                                                    prescription.id
                                                        ? "2px solid #0f8b9d"
                                                        : "1px solid #dce5eb",

                                                borderRadius:
                                                    "12px",

                                                padding:
                                                    "20px",

                                                marginBottom:
                                                    "12px",

                                                cursor:
                                                    "pointer",

                                                background:
                                                    selectedPrescription?.id ===
                                                    prescription.id
                                                        ? "#f1fbfc"
                                                        : "#ffffff"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display:
                                                        "grid",

                                                    gridTemplateColumns:
                                                        "repeat(2, 1fr)",

                                                    gap:
                                                        "18px"
                                                }}
                                            >

                                                <div>

                                                    <small>
                                                        Prescription ID
                                                    </small>

                                                    <h3>
                                                        #
                                                        {
                                                            prescription.id
                                                        }
                                                    </h3>

                                                </div>


                                                <div>

                                                    <small>
                                                        Doctor
                                                    </small>

                                                    <h3>
                                                        {
                                                            prescription.doctor?.fullName ||
                                                            prescription.doctor?.name ||
                                                            "Doctor"
                                                        }
                                                    </h3>

                                                </div>


                                                <div>

                                                    <small>
                                                        Medicine
                                                    </small>

                                                    <h3>
                                                        {
                                                            prescription.medicine ||
                                                            "-"
                                                        }
                                                    </h3>

                                                </div>


                                                <div>

                                                    <small>
                                                        Dosage
                                                    </small>

                                                    <h3>
                                                        {
                                                            prescription.dosage ||
                                                            "-"
                                                        }
                                                    </h3>

                                                </div>


                                                <div>

                                                    <small>
                                                        Frequency
                                                    </small>

                                                    <h3>
                                                        {
                                                            prescription.frequency ||
                                                            "-"
                                                        }
                                                    </h3>

                                                </div>


                                                <div>

                                                    <small>
                                                        Duration
                                                    </small>

                                                    <h3>
                                                        {
                                                            prescription.duration ||
                                                            "-"
                                                        }
                                                    </h3>

                                                </div>

                                            </div>


                                            <div
                                                style={{
                                                    marginTop:
                                                        "16px"
                                                }}
                                            >

                                                <small>
                                                    Doctor's Instructions
                                                </small>

                                                <p>
                                                    {
                                                        prescription.instructions ||
                                                        "-"
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </section>

                )}


                {/* =================================================
                    PHARMACY BILLING
                ================================================= */}

                {selectedPrescription && (

                    <section className="pharmacist-section">

                        <div className="pharmacist-section-heading">

                            <div>

                                <h2>
                                    4. Pharmacy Billing
                                </h2>

                                <p>
                                    Enter the price and quantity for the prescribed medicine.
                                </p>

                            </div>

                        </div>


                        <div
                            style={{
                                background: "#f7fafc",
                                padding: "20px",
                                borderRadius: "12px",
                                marginBottom: "20px"
                            }}
                        >

                            <h3>
                                Medicine:{" "}
                                {
                                    selectedPrescription.medicine ||
                                    "-"
                                }
                            </h3>

                            <p>
                                Patient:{" "}
                                {getPatientName()}
                            </p>

                            <p>
                                Appointment:{" "}
                                {
                                    getAppointmentDisplayId(
                                        selectedAppointment
                                    )
                                }
                            </p>

                        </div>


                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1fr 1fr",
                                gap: "20px"
                            }}
                        >

                            {/* PRICE */}

                            <div>

                                <label>
                                    Price per tablet (₹)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        pricePerTablet
                                    }
                                    onChange={(e) =>
                                        setPricePerTablet(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter price per tablet"
                                />

                            </div>


                            {/* QUANTITY */}

                            <div>

                                <label>
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        quantity
                                    }
                                    onChange={(e) =>
                                        setQuantity(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter quantity"
                                />

                            </div>

                        </div>


                        {/* TOTAL */}

                        <div
                            style={{
                                marginTop: "20px",
                                padding: "20px",
                                background: "#f1f8fa",
                                borderRadius: "12px",
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center"
                            }}
                        >

                            <strong>
                                Total Amount
                            </strong>

                            <strong
                                style={{
                                    fontSize: "24px"
                                }}
                            >
                                ₹
                                {totalAmount.toFixed(2)}
                            </strong>

                        </div>


                        {/* CREATE BILL */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "flex-end",
                                marginTop: "20px"
                            }}
                        >

                            <button
                                className="pharmacist-primary-btn"
                                onClick={createBill}
                                disabled={
                                    creatingBill
                                }
                            >

                                {creatingBill
                                    ? "Creating..."
                                    : "Create Bill"}

                            </button>

                        </div>

                    </section>

                )}


                {/* =================================================
                    MESSAGE
                ================================================= */}

                {message && (

                    <div
                        style={{
                            padding: "14px 18px",
                            background: "#e8f7ee",
                            color: "#16834b",
                            borderRadius: "10px",
                            marginBottom: "20px"
                        }}
                    >
                        ✓ {message}
                    </div>

                )}


                {error && (

                    <div
                        style={{
                            padding: "14px 18px",
                            background: "#fff1f1",
                            color: "#c0392b",
                            borderRadius: "10px",
                            marginBottom: "20px"
                        }}
                    >
                        ⚠ {error}
                    </div>

                )}


                {/* =================================================
                    EXISTING BILLS
                ================================================= */}

                <section className="pharmacist-section">

                    <div className="pharmacist-section-heading">

                        <div>

                            <h2>
                                Pharmacy Bills
                            </h2>

                            <p>
                                Existing pharmacy billing records.
                            </p>

                        </div>


                        <button
                            className="pharmacist-view-btn"
                            onClick={
                                loadPatientBills
                            }
                        >
                            Load Bills
                        </button>

                    </div>


                    {loadingBills ? (

                        <div className="pharmacist-empty">
                            Loading bills...
                        </div>

                    ) : bills.length === 0 ? (

                        <div className="pharmacist-empty">
                            No pharmacy bills available.
                        </div>

                    ) : (

                        <div className="pharmacist-table-wrapper">

                            <table className="pharmacist-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Bill Number
                                        </th>

                                        <th>
                                            Medicine
                                        </th>

                                        <th>
                                            Price
                                        </th>

                                        <th>
                                            Quantity
                                        </th>

                                        <th>
                                            Total
                                        </th>

                                        <th>
                                            Payment
                                        </th>

                                        <th>
                                            Dispensing
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {bills.map(
                                        (bill) => (

                                            <tr
                                                key={
                                                    bill.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        bill.billNumber ||
                                                        `#${bill.id}`
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        bill.medicineName ||
                                                        bill.medicine?.name ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    ₹
                                                    {Number(
                                                        bill.pricePerTablet ||
                                                        0
                                                    ).toFixed(2)}
                                                </td>

                                                <td>
                                                    {
                                                        bill.quantity ||
                                                        0
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            bill.totalAmount ||
                                                            0
                                                        ).toFixed(2)}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="pharmacist-status">
                                                        {
                                                            bill.paymentStatus ||
                                                            "PENDING"
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="pharmacist-status">
                                                        {
                                                            bill.dispensingStatus ||
                                                            "PENDING"
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

                </section>

            </main>

        </div>
    );
};

export default PharmacyBilling;