import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./patient.css";

const MedicalHistory = () => {
    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const patientId = user.userId;

    const [patient, setPatient] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const [patientResponse, historyResponse] =
                await Promise.all([
                    api.get(`/patient/${patientId}`),
                    api.get(`/patient/${patientId}/consultations`)
                ]);

            setPatient(patientResponse.data);
            setHistory(historyResponse.data || []);

        } catch (err) {
            console.error(err);
            setError("Unable to load medical history.");
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

            {/* SIDEBAR */}
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

                    <button onClick={() => navigate("/patient/profile")}>
                        <span>👤</span>
                        My Profile
                    </button>

                    <button onClick={() => navigate("/patient/book-appointment")}>
                        <span>➕</span>
                        Book Appointment
                    </button>

                    <button onClick={() => navigate("/patient/appointments")}>
                        <span>📅</span>
                        My Appointments
                    </button>

                    <button className="active">
                        <span>📋</span>
                        Medical History
                    </button>

                    <button onClick={() => navigate("/patient/prescriptions")}>
                        <span>💊</span>
                        Prescriptions
                    </button>

                    <button onClick={() => navigate("/patient/lab-reports")}>
                        <span>🧪</span>
                        Lab Reports
                    </button>

                    <button onClick={() => navigate("/patient/bills")}>
                        <span>💳</span>
                        Bills
                    </button>

                    <button onClick={() => navigate("/patient/admission")}>
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


            {/* MAIN */}
            <main className="patient-main">

                <header className="patient-header">

                    <div>
                        <p className="patient-label">
                            MEDICAL RECORDS
                        </p>

                        <h1>Medical History</h1>

                        <p>
                            View your consultation and treatment history.
                        </p>
                    </div>

                </header>


                {loading ? (

                    <section className="patient-section">
                        <div className="patient-empty">
                            Loading medical history...
                        </div>
                    </section>

                ) : error ? (

                    <section className="patient-section">
                        <div className="patient-error">
                            {error}
                        </div>
                    </section>

                ) : (

                    <>
                        {/* PATIENT INFORMATION */}

                        {patient && (
                            <section className="patient-section">

                                <h2>Patient Information</h2>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(200px, 1fr))",
                                        gap: "15px",
                                        marginTop: "20px"
                                    }}
                                >

                                    <InfoBox
                                        label="Patient ID"
                                        value={patient.id || patientId}
                                    />

                                    <InfoBox
                                        label="UHID"
                                        value={patient.uhid || "-"}
                                    />

                                    <InfoBox
                                        label="Patient Name"
                                        value={patient.fullName || "-"}
                                    />

                                    <InfoBox
                                        label="Mobile"
                                        value={patient.mobile || "-"}
                                    />

                                    <InfoBox
                                        label="Email"
                                        value={patient.email || "-"}
                                    />

                                    <InfoBox
                                        label="Gender"
                                        value={patient.gender || "-"}
                                    />

                                    <InfoBox
                                        label="Date of Birth"
                                        value={patient.dateOfBirth || "-"}
                                    />

                                </div>

                            </section>
                        )}


                        {/* CONSULTATION HISTORY */}

                        <section className="patient-section">

                            <h2>Consultation History</h2>

                            {history.length === 0 ? (

                                <div className="patient-empty">
                                    No medical history available.
                                </div>

                            ) : (

                                <div className="patient-history-list">

                                    {history.map((record, index) => (

                                        <div
                                            className="patient-history-card"
                                            key={record.id || index}
                                        >

                                            {/* VISIT HEADER */}

                                            <div className="patient-history-date">

                                                <div className="patient-history-icon">
                                                    🩺
                                                </div>

                                                <div>

                                                    <strong>
                                                        Visit {index + 1}
                                                    </strong>

                                                    <span>
                                                        {record.date ||
                                                            record.consultationDate ||
                                                            record.createdAt ||
                                                            "-"}
                                                    </span>

                                                </div>

                                            </div>


                                            {/* IDs */}

                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "repeat(auto-fit, minmax(200px, 1fr))",
                                                    gap: "15px",
                                                    marginBottom: "20px"
                                                }}
                                            >

                                                <InfoBox
                                                    label="Appointment ID"
                                                    value={
                                                        record.appointment?.appointmentId ||
                                                        record.appointmentId ||
                                                        "-"
                                                    }
                                                />

                                                <InfoBox
                                                    label="Doctor ID"
                                                    value={
                                                        record.doctor?.id ||
                                                        record.doctorId ||
                                                        "-"
                                                    }
                                                />

                                                <InfoBox
                                                    label="Doctor Name"
                                                    value={
                                                        record.doctor?.fullName ||
                                                        record.doctorName ||
                                                        "Doctor"
                                                    }
                                                />

                                                <InfoBox
                                                    label="Department"
                                                    value={
                                                        record.doctor?.department ||
                                                        record.department ||
                                                        "-"
                                                    }
                                                />

                                                <InfoBox
                                                    label="Specialization"
                                                    value={
                                                        record.doctor?.specialization ||
                                                        record.specialization ||
                                                        "-"
                                                    }
                                                />

                                            </div>


                                            {/* MEDICAL DETAILS */}

                                            <div className="patient-history-content">

                                                <div>
                                                    <label>Reason for Visit</label>

                                                    <p>
                                                        {record.reason || "-"}
                                                    </p>
                                                </div>


                                                <div>
                                                    <label>Symptoms</label>

                                                    <p>
                                                        {record.symptoms || "-"}
                                                    </p>
                                                </div>


                                                <div>
                                                    <label>Examination</label>

                                                    <p>
                                                        {record.examination || "-"}
                                                    </p>
                                                </div>


                                                <div>
                                                    <label>Diagnosis</label>

                                                    <p>
                                                        {record.diagnosis || "-"}
                                                    </p>
                                                </div>


                                                <div>
                                                    <label>Clinical Notes</label>

                                                    <p>
                                                        {record.clinicalNotes ||
                                                            record.notes ||
                                                            "-"}
                                                    </p>
                                                </div>


                                                <div>
                                                    <label>Treatment Plan</label>

                                                    <p>
                                                        {record.treatmentPlan ||
                                                            "-"}
                                                    </p>
                                                </div>


                                                <div>
                                                    <label>Follow-up</label>

                                                    <p>
                                                        {record.followUpDate ||
                                                            record.followUp ||
                                                            "-"}
                                                    </p>
                                                </div>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </section>

                    </>
                )}

            </main>

        </div>
    );
};


/* INFORMATION BOX */

const InfoBox = ({ label, value }) => {

    return (
        <div
            style={{
                background: "#f5f9fb",
                border: "1px solid #e1e9ee",
                borderRadius: "10px",
                padding: "15px"
            }}
        >

            <label
                style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#78909c",
                    fontWeight: "600",
                    marginBottom: "6px"
                }}
            >
                {label}
            </label>

            <strong
                style={{
                    display: "block",
                    fontSize: "15px",
                    color: "#173f5f",
                    wordBreak: "break-word"
                }}
            >
                {value}
            </strong>

        </div>
    );
};


export default MedicalHistory;