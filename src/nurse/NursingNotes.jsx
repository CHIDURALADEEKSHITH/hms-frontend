import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./nurse.css";

const NursingNotes = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { logout: clearAuthSession } = useAuth();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const nurseId = user.userId;

    const selectedPatientId = searchParams.get("patientId");

    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(
        selectedPatientId || ""
    );

    const [noteType, setNoteType] = useState("GENERAL");
    const [note, setNote] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const response = await api.get(`/nurse/${nurseId}/patients`);

            const data = response.data || [];

            setPatients(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!selectedPatient) {
            setError("Please select a patient.");
            return;
        }

        if (!note.trim()) {
            setError("Please enter a nursing note.");
            return;
        }

        try {
            setLoading(true);

            const data = {
                nurseId: nurseId,
                patientId: Number(selectedPatient),
                noteType: noteType,
                note: note
            };

            await api.post("/nurse/notes", data);

            setMessage("Nursing note added successfully.");
            setNote("");
        } catch (err) {
            console.error(err);

            if (err.response?.data) {
                setError(
                    typeof err.response.data === "string"
                        ? err.response.data
                        : "Unable to save nursing note."
                );
            } else {
                setError("Unable to save nursing note.");
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearAuthSession();
        navigate("/", { replace: true });
    };

    return (
        <div className="nurse-page">

            <aside className="nurse-sidebar">

                <div className="nurse-logo">
                    <div className="logo-icon">+</div>

                    <div>
                        <h2>Thilak Hospital</h2>
                        <span>Nurse Portal</span>
                    </div>
                </div>

                <nav className="nurse-nav">

                    <button onClick={() => navigate("/nurse")}>
                        <span>▣</span>
                        Dashboard
                    </button>

                    <button onClick={() => navigate("/nurse/patients")}>
                        <span>👥</span>
                        Patients
                    </button>

                    <button onClick={() => navigate("/nurse/vitals")}>
                        <span>♥</span>
                        Patient Vitals
                    </button>

                    <button className="active">
                        <span>📝</span>
                        Nursing Notes
                    </button>

                </nav>

                <button className="nurse-logout" onClick={logout}>
                    ⇥ Logout
                </button>

            </aside>

            <main className="nurse-main">

                <header className="nurse-header">

                    <div>
                        <p className="page-label">PATIENT CARE</p>
                        <h1>Nursing Notes</h1>
                        <p>
                            Record patient observations and nursing care
                            activities.
                        </p>
                    </div>

                    <div className="nurse-user">

                        <div className="nurse-avatar">
                            {(user.name || "N").charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <strong>{user.name || "Nurse"}</strong>
                            <span>Nurse ID: {nurseId}</span>
                        </div>

                    </div>

                </header>

                <section className="nurse-form-card">

                    <div className="form-card-heading">
                        <h2>Add Nursing Note</h2>
                        <p>
                            Document important observations and nursing
                            activities.
                        </p>
                    </div>

                    {message && (
                        <div className="success-message">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="nurse-form-grid">

                            <div className="form-group">
                                <label>Patient</label>

                                <select
                                    value={selectedPatient}
                                    onChange={(e) =>
                                        setSelectedPatient(e.target.value)
                                    }
                                    required
                                >
                                    <option value="">
                                        Select Patient
                                    </option>

                                    {patients.map((patient) => (
                                        <option
                                            key={patient.id}
                                            value={patient.id}
                                        >
                                            {patient.fullName ||
                                                patient.patientName ||
                                                "Patient"}{" "}
                                            {patient.uhid
                                                ? `- ${patient.uhid}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Note Type</label>

                                <select
                                    value={noteType}
                                    onChange={(e) =>
                                        setNoteType(e.target.value)
                                    }
                                >
                                    <option value="GENERAL">
                                        General Observation
                                    </option>

                                    <option value="MEDICATION">
                                        Medication
                                    </option>

                                    <option value="TREATMENT">
                                        Treatment
                                    </option>

                                    <option value="PATIENT_CONDITION">
                                        Patient Condition
                                    </option>

                                    <option value="ADMISSION">
                                        Admission Care
                                    </option>

                                    <option value="DISCHARGE">
                                        Discharge Care
                                    </option>
                                </select>
                            </div>

                        </div>

                        <div className="form-group full-width">

                            <label>Nursing Note</label>

                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows="9"
                                placeholder="Enter patient observations, care provided, response to treatment, or other nursing information..."
                                required
                            />

                        </div>

                        <div className="form-actions">

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => navigate("/nurse")}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={loading}
                            >
                                {loading
                                    ? "Saving..."
                                    : "Save Nursing Note"}
                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>
    );
};

export default NursingNotes;