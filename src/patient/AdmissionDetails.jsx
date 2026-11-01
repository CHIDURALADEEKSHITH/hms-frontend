import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./patient.css";

const AdmissionDetails = () => {
    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const patientId = user.userId;

    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
            loadAdmissions();
    }, []);

    const loadAdmissions = async () => {
        try {
            const response = await api.get(
                `/patient/${patientId}/admissions`
            );

            const data = response.data;
            setAdmissions(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data?.admissions)
                        ? data.admissions
                        : data
                            ? [data]
                            : []
            );
        } catch (err) {
            console.error(err);
            setError("Unable to load admission details.");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearAuth();
        navigate("/");
    };

    const activeAdmissions = admissions.filter((admission) =>
        !["DISCHARGED", "CANCELLED"].includes(
            String(admission.status || admission.admissionStatus || "")
                .toUpperCase()
        )
    ).length;

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

                    <button
                        onClick={() =>
                            navigate("/patient/prescriptions")
                        }
                    >
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

                    <button className="active">
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
                            PATIENT CARE
                        </p>

                        <h1>Admission Details</h1>

                        <p>
                            View your current and previous hospital admissions.
                        </p>
                    </div>

                </header>

                <section className="patient-stats">

                    <div className="patient-stat-card">

                        <div className="patient-stat-icon blue">
                            🏥
                        </div>

                        <div>
                            <span>Total Admissions</span>
                            <strong>
                                {admissions.length}
                            </strong>
                        </div>

                    </div>

                    <div className="patient-stat-card">

                        <div className="patient-stat-icon green">
                            🛏️
                        </div>

                        <div>
                            <span>Active Admissions</span>
                            <strong>
                                {activeAdmissions}
                            </strong>
                        </div>

                    </div>

                </section>

                <section className="patient-section">

                    {loading ? (
                        <div className="patient-empty">
                            Loading admission details...
                        </div>
                    ) : error ? (
                        <div className="patient-error">
                            {error}
                        </div>
                    ) : admissions.length === 0 ? (
                        <div className="patient-empty">
                            No admission records available.
                        </div>
                    ) : (

                        <div className="patient-table-wrapper">

                            <table className="patient-table">

                                <thead>
                                    <tr>
                                        <th>Admission ID</th>
                                        <th>Admission Date</th>
                                        <th>Doctor</th>
                                        <th>Ward</th>
                                        <th>Room / Bed</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {admissions.map(
                                        (admission, index) => (

                                            <tr
                                                key={
                                                    admission.id ||
                                                    admission.admissionId ||
                                                    index
                                                }
                                            >

                                                <td>
                                                    {admission.admissionId ||
                                                        admission.id ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    {admission.admissionDate ||
                                                        admission.date ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    {admission.doctorName ||
                                                        admission.doctor?.name ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    {admission.ward ||
                                                        admission.wardName ||
                                                        "-"}
                                                </td>

                                                <td>
                                                    {admission.room?.roomNumber ||
                                                        admission.roomNumber ||
                                                        "-"}
                                                    {admission.bed?.bedNumber ||
                                                        admission.bedNumber
                                                        ? ` / ${admission.bed?.bedNumber || admission.bedNumber}`
                                                        : ""}
                                                </td>

                                                <td>
                                                    <span className="patient-status">
                                                        {admission.status ||
                                                            admission.admissionStatus ||
                                                            "ACTIVE"}
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

export default AdmissionDetails;