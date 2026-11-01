import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./lab.css";

const TestResults = () => {

    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // =========================================================
    // LOAD COMPLETED TEST RESULTS
    // =========================================================

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {

        try {

            setLoading(true);

            const response = await api.get("/lab/tests");

            const tests = Array.isArray(response.data)
                ? response.data
                : [];

            // Only completed tests with a result
            const completed = tests.filter(
                (item) =>
                    item.status === "COMPLETED" &&
                    item.result
            );

            console.log("Completed laboratory results:", completed);

            setResults(completed);

        } catch (error) {

            console.error(
                "Unable to load results:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            setResults([]);

        } finally {

            setLoading(false);

        }

    };

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredResults = results.filter((item) => {

        const value = search.toLowerCase().trim();

        const testId =
            String(item.id || "");

        const patientId =
            String(item.patient?.id || "");

        const patientName =
            String(item.patient?.fullName || "");

        const appointmentId =
            String(item.appointment?.appointmentId || "");

        const testName =
            String(item.testName || "");

        const testCategory =
            String(item.testCategory || "");

        return (
            testId.toLowerCase().includes(value) ||
            patientId.toLowerCase().includes(value) ||
            patientName.toLowerCase().includes(value) ||
            appointmentId.toLowerCase().includes(value) ||
            testName.toLowerCase().includes(value) ||
            testCategory.toLowerCase().includes(value)
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
                        Test Results
                    </h1>

                    <p>
                        View completed laboratory test results
                    </p>

                </div>

                <button
                    className="refresh-button"
                    onClick={loadResults}
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
                RESULTS
            ====================================================== */}

            <div className="results-grid">

                {loading ? (

                    <div className="lab-loading">
                        Loading results...
                    </div>

                ) : filteredResults.length === 0 ? (

                    <div className="lab-empty">

                        <div>
                            📋
                        </div>

                        <h3>
                            No Test Results
                        </h3>

                        <p>
                            Completed laboratory results will
                            appear here.
                        </p>

                    </div>

                ) : (

                    filteredResults.map((item) => (

                        <div
                            className="result-card"
                            key={item.id}
                        >

                            {/* =================================================
                                CARD HEADER
                            ================================================== */}

                            <div className="result-card-header">

                                <div className="result-icon">
                                    🧪
                                </div>

                                <div>

                                    <h3>
                                        {item.testName ||
                                            "Laboratory Test"}
                                    </h3>

                                    <span>
                                        Test #{item.id}
                                    </span>

                                </div>

                                <span className="status-badge completed">
                                    COMPLETED
                                </span>

                            </div>

                            {/* =================================================
                                PATIENT / APPOINTMENT DETAILS
                            ================================================== */}

                            <div className="result-details">

                                {/* Patient ID */}

                                <div>

                                    <span>
                                        Patient ID
                                    </span>

                                    <strong>
                                        {item.patient?.id ?? "-"}
                                    </strong>

                                </div>

                                {/* Patient Name */}

                                <div>

                                    <span>
                                        Patient Name
                                    </span>

                                    <strong>
                                        {item.patient?.fullName ?? "-"}
                                    </strong>

                                </div>

                                {/* Appointment ID */}

                                <div>

                                    <span>
                                        Appointment ID
                                    </span>

                                    <strong>
                                        {item.appointment?.appointmentId ?? "-"}
                                    </strong>

                                </div>

                                {/* Test */}

                                <div>

                                    <span>
                                        Test
                                    </span>

                                    <strong>
                                        {item.testName ?? "-"}
                                    </strong>

                                </div>

                                {/* Category */}

                                <div>

                                    <span>
                                        Category
                                    </span>

                                    <strong>
                                        {item.testCategory ?? "OTHER"}
                                    </strong>

                                </div>

                                {/* Test Date */}

                                <div>

                                    <span>
                                        Test Date
                                    </span>

                                    <strong>
                                        {item.testDate ?? "-"}
                                    </strong>

                                </div>

                                {/* Report Date */}

                                <div>

                                    <span>
                                        Report Date
                                    </span>

                                    <strong>
                                        {item.reportDate ?? "-"}
                                    </strong>

                                </div>

                            </div>

                            {/* =================================================
                                RESULT
                            ================================================== */}

                            <div className="result-content">

                                <h4>
                                    Test Result
                                </h4>

                                <p>
                                    {item.result ||
                                        "No result entered."}
                                </p>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>

    );

};

export default TestResults;