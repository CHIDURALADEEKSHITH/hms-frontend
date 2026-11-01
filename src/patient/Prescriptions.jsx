import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./patient.css";

const Prescriptions = () => {
    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const patientId = user.userId;

    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadPrescriptions();
    }, []);

    const loadPrescriptions = async () => {
        try {
            const response = await api.get(
                `/patient/${patientId}/prescriptions`
            );

            setPrescriptions(response.data || []);
        } catch (err) {
            console.error(err);
            setError("Unable to load prescriptions.");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearAuth();
        navigate("/");
    };

    return (
        <div className="patient-page">

            <aside className="patient-sidebar">

                <div className="patient-logo">
                    <div className="patient-logo-icon">+</div>

                    <div>
                        <h2>Thilak Hospital</h2>
                        <span>Patient Portal</span>
                    </div>
                </div>

                <nav className="patient-nav">

                    <button onClick={() => navigate("/patient")}>
                        <span>▣</span>
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/profile")
                        }
                    >
                        <span>👤</span>
                        My Profile
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/book-appointment")
                        }
                    >
                        <span>➕</span>
                        Book Appointment
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/appointments")
                        }
                    >
                        <span>📅</span>
                        My Appointments
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/medical-history")
                        }
                    >
                        <span>📋</span>
                        Medical History
                    </button>

                    <button className="active">
                        <span>💊</span>
                        Prescriptions
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/lab-reports")
                        }
                    >
                        <span>🧪</span>
                        Lab Reports
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/bills")
                        }
                    >
                        <span>💳</span>
                        Bills
                    </button>

                    <button
                        onClick={() =>
                            navigate("/patient/admission")
                        }
                    >
                        <span>🏥</span>
                        Admission
                    </button>

                </nav>

                <button
                    className="patient-logout"
                    onClick={logout}
                >
                    ⇥ Logout
                </button>

            </aside>

            <main className="patient-main">

                <header className="patient-header">

                    <div>
                        <p className="patient-label">
                            MEDICATION
                        </p>

                        <h1>Prescriptions</h1>

                        <p>
                            View medicines prescribed by your doctors.
                        </p>
                    </div>

                </header>

                <section className="patient-section">

                    {loading ? (
                        <div className="patient-empty">
                            Loading prescriptions...
                        </div>
                    ) : error ? (
                        <div className="patient-error">
                            {error}
                        </div>
                    ) : prescriptions.length === 0 ? (
                        <div className="patient-empty">
                            No prescriptions available.
                        </div>
                    ) : (

                        <div className="patient-prescription-grid">

                            {prescriptions.map(
                                (prescription, index) => (

                                    <div
                                        className="patient-prescription-card"
                                        key={
                                            prescription.id ||
                                            index
                                        }
                                    >

                                        <div className="patient-prescription-header">

                                            <div className="patient-prescription-icon">
                                                💊
                                            </div>

                                            <div>
                                                <h3>
                                                    {prescription.medicineName ||
                                                        prescription.medicine ||
                                                        "Medicine"}
                                                </h3>

                                                <span>
                                                    Doctor:{" "}
                                                    {prescription.doctorName ||
                                                        "Doctor"}
                                                </span>
                                            </div>

                                        </div>

                                        <div className="patient-prescription-details">

                                            <div>
                                                <label>Dosage</label>
                                                <strong>
                                                    {prescription.dosage ||
                                                        "-"}
                                                </strong>
                                            </div>

                                            <div>
                                                <label>Frequency</label>
                                                <strong>
                                                    {prescription.frequency ||
                                                        "-"}
                                                </strong>
                                            </div>

                                            <div>
                                                <label>Duration</label>
                                                <strong>
                                                    {prescription.duration ||
                                                        "-"}
                                                </strong>
                                            </div>

                                            <div>
                                                <label>Date</label>
                                                <strong>
                                                    {prescription.date ||
                                                        prescription.prescriptionDate ||
                                                        "-"}
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="patient-prescription-instructions">

                                            <label>
                                                Instructions
                                            </label>

                                            <p>
                                                {prescription.instructions ||
                                                    "Follow your doctor's instructions."}
                                            </p>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
};

export default Prescriptions;