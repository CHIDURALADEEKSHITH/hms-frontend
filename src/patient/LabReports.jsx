import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./patient.css";

const LabReports = () => {
    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const patientId = user.userId;

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        if (patientId) {
            loadReports();
        } else {
            setError("Patient information not found.");
            setLoading(false);
        }

    }, [patientId]);


    const loadReports = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                `/patient/${patientId}/lab-tests`
            );

            const tests = Array.isArray(response.data)
                ? response.data
                : [];

            console.log(
                "Patient laboratory tests:",
                tests
            );

            /*
             * Show completed tests that have
             * an uploaded PDF report.
             */
            const completedReports = tests.filter(
                (test) =>
                    test.status === "COMPLETED" &&
                    test.reportFilePath
            );

            console.log(
                "Patient laboratory reports:",
                completedReports
            );

            setReports(completedReports);

        } catch (err) {

            console.error(
                "Unable to load lab reports:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                typeof err.response?.data === "string"
                    ? err.response.data
                    : "Unable to load laboratory reports."
            );

        } finally {

            setLoading(false);
        }
    };


    const openReport = async (testId) => {

        try {

            const response = await api.get(
                `/lab/test/${testId}/report`,
                {
                    responseType: "blob"
                }
            );

            const file = new Blob(
                [response.data],
                {
                    type: "application/pdf"
                }
            );

            const fileURL =
                window.URL.createObjectURL(file);

            window.open(
                fileURL,
                "_blank"
            );

        } catch (err) {

            console.error(
                "Unable to open report:",
                err
            );

            alert(
                "Unable to open laboratory report."
            );
        }
    };

    const logout = () => {
        clearAuth();
        navigate("/");
    };

    return (
        <div className="patient-page patient-lab-reports-page">
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
                    <button onClick={() => navigate("/patient/medical-history")}>
                        <span>📋</span>
                        Medical History
                    </button>
                    <button onClick={() => navigate("/patient/prescriptions")}>
                        <span>💊</span>
                        Prescriptions
                    </button>
                    <button className="active">
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

                <button className="patient-logout" onClick={logout}>
                    ⇥ Logout
                </button>
            </aside>

            <main className="patient-main">
                <header className="patient-header">
                    <div>
                        <p className="patient-label">DIAGNOSTICS</p>
                        <h1>Lab Reports</h1>
                        <p>View completed laboratory and diagnostic reports.</p>
                    </div>
                </header>

                <section className="patient-section patient-lab-reports-section">
                    {loading ? (
                        <div className="patient-empty">
                            Loading laboratory reports...
                        </div>
                    ) : error ? (
                        <div className="patient-error">{error}</div>
                    ) : reports.length === 0 ? (
                        <div className="patient-empty">
                            <h3>No laboratory reports available</h3>
                            <p>Completed laboratory reports will appear here.</p>
                        </div>
                    ) : (
                        <div className="patient-table-wrapper">
                            <table className="patient-table">
                                <thead>
                                    <tr>
                                        <th>Test</th>
                                        <th>Category</th>
                                        <th>Appointment</th>
                                        <th>Doctor</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Report</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report.id}>
                                            <td>
                                                <strong>{report.testName || "-"}</strong>
                                            </td>
                                            <td>{report.testCategory || "-"}</td>
                                            <td>
                                                {report.appointment?.appointmentId ||
                                                    report.appointment?.id ||
                                                    "-"}
                                            </td>
                                            <td>{report.doctor?.fullName || "Doctor"}</td>
                                            <td>{report.reportDate || report.testDate || "-"}</td>
                                            <td>
                                                <span className="patient-status completed">
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="patient-small-button"
                                                    onClick={() => openReport(report.id)}
                                                >
                                                    PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default LabReports;