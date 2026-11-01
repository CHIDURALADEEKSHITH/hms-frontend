import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./pharmacist.css";

const PrescriptionRequests = () => {
    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const [patientId, setPatientId] = useState("");
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);

    const [selectedAppointment, setSelectedAppointment] = useState("");
    const [selectedPrescription, setSelectedPrescription] = useState("");

    const [pricePerTablet, setPricePerTablet] = useState("");
    const [quantity, setQuantity] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =========================================================
    // LOAD PATIENT APPOINTMENTS
    // =========================================================

    const loadAppointments = async () => {
        if (!patientId) {
            setError("Please enter Patient ID.");
            return;
        }

        setError("");
        setMessage("");
        setAppointments([]);
        setPrescriptions([]);
        setSelectedAppointment("");
        setSelectedPrescription("");

        try {
            setLoading(true);

            const response = await api.get(
                `/pharmacist/patient/${patientId}/appointments`
            );

            setAppointments(response.data || []);

            if (!response.data || response.data.length === 0) {
                setMessage("No appointments found for this patient.");
            }

        } catch (err) {
            console.error("Appointment loading error:", err);

            setError(
                err.response?.data ||
                "Failed to load patient appointments."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD PRESCRIPTIONS FOR SELECTED APPOINTMENT
    // =========================================================

    const loadPrescriptions = async (appointmentId) => {
        setSelectedAppointment(appointmentId);
        setPrescriptions([]);
        setSelectedPrescription("");
        setMessage("");
        setError("");

        if (!appointmentId) {
            return;
        }

        try {
            setLoading(true);

            const response = await api.get(
                `/pharmacist/appointment/${appointmentId}/prescriptions`
            );

            setPrescriptions(response.data || []);

            if (!response.data || response.data.length === 0) {
                setMessage(
                    "No prescriptions found for this appointment."
                );
            }

        } catch (err) {
            console.error("Prescription loading error:", err);

            setError(
                err.response?.data ||
                "No prescription found for this appointment."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // CREATE PHARMACY BILL
    // =========================================================

    const createBill = async () => {
        if (!patientId) {
            setError("Patient ID is required.");
            return;
        }

        if (!selectedPrescription) {
            setError("Please select a prescription.");
            return;
        }

        if (!pricePerTablet || Number(pricePerTablet) <= 0) {
            setError("Please enter a valid price per tablet.");
            return;
        }

        if (!quantity || Number(quantity) <= 0) {
            setError("Please enter a valid quantity.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            const response = await api.post(
                "/pharmacist/bill",
                {
                    patient: {
                        id: Number(patientId)
                    },
                    prescription: {
                        id: Number(selectedPrescription)
                    },
                    pricePerTablet: Number(pricePerTablet),
                    quantity: Number(quantity)
                }
            );

            console.log("Pharmacy bill created:", response.data);

            setMessage(
                `Pharmacy bill created successfully. Bill No: ${response.data.billNumber}`
            );

            setPricePerTablet("");
            setQuantity("");

        } catch (err) {
            console.error("Bill creation error:", err);

            setError(
                err.response?.data ||
                "Failed to create pharmacy bill."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // CALCULATE TOTAL
    // =========================================================

    const total =
        pricePerTablet && quantity
            ? Number(pricePerTablet) * Number(quantity)
            : 0;

    const logout = () => {
        clearAuth();
        navigate("/");
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="pharmacist-page">
            <aside className="pharmacist-sidebar">
                <div className="pharmacist-logo">
                    <div className="pharmacist-logo-icon">+</div>
                    <div>
                        <h2>Thilak Hospital</h2>
                        <span>Pharmacy Portal</span>
                    </div>
                </div>

                <nav className="pharmacist-nav" aria-label="Pharmacy navigation">
                    <button onClick={() => navigate("/pharmacist")}>
                        <span>▣</span>
                        Dashboard
                    </button>
                    <button
                        className="active"
                        aria-current="page"
                        onClick={() => navigate("/pharmacist/prescriptions")}
                    >
                        <span>💊</span>
                        Prescription Requests
                    </button>
                    <button onClick={() => navigate("/pharmacist/billing")}>
                        <span>🧾</span>
                        Pharmacy Billing
                    </button>
                    <button onClick={() => navigate("/pharmacist/dispensing")}>
                        <span>💉</span>
                        Dispensing
                    </button>
                </nav>

                <button className="pharmacist-logout" onClick={logout}>
                    ⇥ Logout
                </button>
            </aside>

            <main className="pharmacist-main">
                <header className="pharmacist-header">
                    <div>
                        <p className="pharmacist-label">PHARMACY MANAGEMENT</p>
                        <h1>Prescription Requests</h1>
                        <p>View doctor prescriptions and create pharmacy bills.</p>
                    </div>
                </header>

                <section className="pharmacist-form-card">
                    <div className="pharmacist-form-heading">
                        <h2>Patient Search</h2>
                        <p>Enter a patient ID to view their appointments and prescriptions.</p>
                    </div>

                    <form
                        className="pharmacist-search-form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            loadAppointments();
                        }}
                    >
                        <div className="pharmacist-form-group">
                            <label htmlFor="prescription-patient-id">Patient ID</label>
                            <input
                                id="prescription-patient-id"
                                type="number"
                                min="1"
                                value={patientId}
                                onChange={(event) => setPatientId(event.target.value)}
                                placeholder="Enter Patient ID"
                            />
                        </div>
                        <button
                            className="pharmacist-primary-btn"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Find Patient"}
                        </button>
                    </form>
                </section>

                {error && (
                    <div className="pharmacist-error" role="alert">
                        {error}
                    </div>
                )}

                {message && (
                    <div
                        className={error ? "pharmacist-error" : "pharmacist-success"}
                        role="status"
                    >
                        {message}
                    </div>
                )}

                {appointments.length > 0 && (
                    <section className="pharmacist-form-card">
                        <div className="pharmacist-form-heading">
                            <h2>Patient Appointments</h2>
                            <p>Select an appointment to review its prescriptions.</p>
                        </div>
                        <div className="pharmacist-form-group">
                            <label htmlFor="prescription-appointment">Appointment</label>
                            <select
                                id="prescription-appointment"
                                value={selectedAppointment}
                                onChange={(event) => loadPrescriptions(event.target.value)}
                                disabled={loading}
                            >
                                <option value="">Select an appointment</option>
                                {appointments.map((appointment) => (
                                    <option key={appointment.id} value={appointment.id}>
                                        {appointment.appointmentId || `Appointment #${appointment.id}`}
                                        {" - "}
                                        {appointment.appointmentDate || "Date unavailable"}
                                        {" - "}
                                        {appointment.status || "Status unavailable"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>
                )}

                {prescriptions.length > 0 && (
                    <section className="pharmacist-section">
                        <div className="pharmacist-section-heading">
                            <div>
                                <h2>Doctor&apos;s Prescriptions</h2>
                                <p>Select a prescription to create its pharmacy bill.</p>
                            </div>
                        </div>

                        <div className="pharmacist-prescription-grid">
                            {prescriptions.map((prescription) => {
                                const isSelected =
                                    String(selectedPrescription) === String(prescription.id);

                                return (
                                    <button
                                        key={prescription.id}
                                        type="button"
                                        className={`pharmacist-prescription-card${isSelected ? " selected" : ""}`}
                                        aria-pressed={isSelected}
                                        onClick={() => setSelectedPrescription(prescription.id)}
                                    >
                                        <strong>{prescription.medicine || "Medicine"}</strong>
                                        <span>Dosage: {prescription.dosage || "-"}</span>
                                        <span>Frequency: {prescription.frequency || "-"}</span>
                                        <span>Duration: {prescription.duration || "-"}</span>
                                        <span>Instructions: {prescription.instructions || "-"}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

                {selectedPrescription && (
                    <section className="pharmacist-form-card">
                        <div className="pharmacist-form-heading">
                            <h2>Pharmacy Billing</h2>
                            <p>Enter the price and quantity to calculate the bill total.</p>
                        </div>

                        <div className="pharmacist-form-grid">
                            <div className="pharmacist-form-group">
                                <label htmlFor="price-per-tablet">Price Per Tablet (₹)</label>
                                <input
                                    id="price-per-tablet"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={pricePerTablet}
                                    onChange={(event) => setPricePerTablet(event.target.value)}
                                    placeholder="Enter price"
                                />
                            </div>
                            <div className="pharmacist-form-group">
                                <label htmlFor="medicine-quantity">Quantity</label>
                                <input
                                    id="medicine-quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(event) => setQuantity(event.target.value)}
                                    placeholder="Enter quantity"
                                />
                            </div>
                        </div>

                        <div className="pharmacist-bill-total">
                            <span>Total Amount</span>
                            <strong>₹{total.toFixed(2)}</strong>
                        </div>

                        <div className="pharmacist-form-actions">
                            <button
                                className="pharmacist-primary-btn"
                                type="button"
                                onClick={createBill}
                                disabled={loading}
                            >
                                {loading ? "Creating Bill..." : "Create Pharmacy Bill"}
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default PrescriptionRequests;