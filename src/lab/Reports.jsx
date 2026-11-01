import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./lab.css";

const Reports = () => {

    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // =========================================================
    // LOAD REPORTS
    // =========================================================

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {

        try {

            setLoading(true);

            const response = await api.get("/lab/tests");

            const tests = Array.isArray(response.data)
                ? response.data
                : [];

            // Only tests that have an uploaded PDF report
            const reportData = tests.filter(
                (item) =>
                    item.reportFilePath &&
                    item.reportFilePath.trim() !== ""
            );

            console.log("Laboratory reports:", reportData);

            setReports(reportData);

        } catch (error) {

            console.error(
                "Unable to load reports:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            setReports([]);

        } finally {

            setLoading(false);

        }

    };

    // =========================================================
    // VIEW / DOWNLOAD PDF REPORT
    // =========================================================

    const downloadReport = async (report) => {

        try {

            const response = await api.get(
                `/lab/test/${report.id}/report`,
                {
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(
                new Blob(
                    [response.data],
                    {
                        type: "application/pdf"
                    }
                )
            );

            window.open(url, "_blank");

            setTimeout(() => {

                window.URL.revokeObjectURL(url);

            }, 1000);

        } catch (error) {

            console.error(
                "Unable to open laboratory report:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            alert(
                "Unable to open laboratory report"
            );

        }

    };

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredReports = reports.filter((report) => {

        const value =
            search.toLowerCase().trim();

        const reportId =
            String(report.id || "");

        const patientId =
            String(report.patient?.id || "");

        const patientName =
            String(report.patient?.fullName || "");

        const appointmentId =
            String(report.appointment?.appointmentId || "");

        const testName =
            String(report.testName || "");

        const testCategory =
            String(report.testCategory || "");

        return (

            reportId
                .toLowerCase()
                .includes(value)

            ||

            patientId
                .toLowerCase()
                .includes(value)

            ||

            patientName
                .toLowerCase()
                .includes(value)

            ||

            appointmentId
                .toLowerCase()
                .includes(value)

            ||

            testName
                .toLowerCase()
                .includes(value)

            ||

            testCategory
                .toLowerCase()
                .includes(value)

        );

    });

    return (

        <div className="lab-page">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="lab-page-header">

                <div>

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/lab")
                        }
                    >
                        ← Dashboard
                    </button>

                    <h1>
                        Laboratory Reports
                    </h1>

                    <p>
                        Manage and access uploaded
                        laboratory PDF reports
                    </p>

                </div>

                <button
                    className="refresh-button"
                    onClick={loadReports}
                >
                    ↻ Refresh
                </button>

            </header>

            {/* =====================================================
                SEARCH
            ====================================================== */}

            <div className="lab-filter-card">

                <div className="lab-search-box">

                    🔍

                    <input
                        type="text"
                        placeholder="Search patient ID, patient name, test or appointment..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

            </div>

            {/* =====================================================
                REPORT TABLE
            ====================================================== */}

            <div className="lab-table-card">

                <div className="lab-table-header">

                    <div>

                        <h2>
                            Available Reports
                        </h2>

                        <span>
                            {filteredReports.length} report(s)
                        </span>

                    </div>

                </div>

                {loading ? (

                    <div className="lab-loading">

                        Loading reports...

                    </div>

                ) : filteredReports.length === 0 ? (

                    <div className="lab-empty">

                        <div>
                            📄
                        </div>

                        <h3>
                            No Reports Available
                        </h3>

                        <p>
                            Uploaded laboratory PDF
                            reports will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="lab-table">

                            <thead>

                                <tr>

                                    <th>
                                        Report ID
                                    </th>

                                    <th>
                                        Patient ID
                                    </th>

                                    <th>
                                        Patient Name
                                    </th>

                                    <th>
                                        Appointment ID
                                    </th>

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
                                        Report Date
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredReports.map(
                                    (report) => (

                                        <tr
                                            key={report.id}
                                        >

                                            {/* Report ID */}

                                            <td>

                                                <strong>
                                                    #{report.id}
                                                </strong>

                                            </td>

                                            {/* Patient ID */}

                                            <td>

                                                {report.patient?.id ?? "-"}

                                            </td>

                                            {/* Patient Name */}

                                            <td>

                                                {report.patient?.fullName ?? "-"}

                                            </td>

                                            {/* Appointment ID */}

                                            <td>

                                                {report.appointment?.appointmentId ?? "-"}

                                            </td>

                                            {/* Test */}

                                            <td>

                                                {report.testName ?? "-"}

                                            </td>

                                            {/* Category */}

                                            <td>

                                                <span className="category-badge">

                                                    {report.testCategory ??
                                                        "OTHER"}

                                                </span>

                                            </td>

                                            {/* Status */}

                                            <td>

                                                <span className="status-badge completed">

                                                    {report.status ??
                                                        "COMPLETED"}

                                                </span>

                                            </td>

                                            {/* Report Date */}

                                            <td>

                                                {report.reportDate ?? "-"}

                                            </td>

                                            {/* PDF Action */}

                                            <td>

                                                <button
                                                    className="table-action primary"
                                                    onClick={() =>
                                                        downloadReport(
                                                            report
                                                        )
                                                    }
                                                >
                                                    📥 View / Download
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

};

export default Reports;