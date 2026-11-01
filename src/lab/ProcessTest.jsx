import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./lab.css";

const ProcessTest = () => {

    const navigate = useNavigate();

    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);

    const [result, setResult] = useState("");
    const [reportFile, setReportFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // =========================================================
    // LOAD PROCESSING TESTS
    // =========================================================

    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {

        try {

            setLoading(true);

            const response = await api.get("/lab/tests");

            const allTests = Array.isArray(response.data)
                ? response.data
                : [];

            const processingTests = allTests.filter(
                (item) => item.status === "IN_PROGRESS"
            );

            console.log(
                "Tests in progress:",
                processingTests
            );

            setTests(processingTests);

        } catch (error) {

            console.error(
                "Unable to load processing tests:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            setTests([]);

        } finally {

            setLoading(false);

        }

    };

    // =========================================================
    // SELECT TEST
    // =========================================================

    const selectTest = (test) => {

        setSelectedTest(test);

        setResult(test.result || "");

        setReportFile(null);

    };

    // =========================================================
    // SELECT PDF
    // =========================================================

    const handleFileChange = (e) => {

        const file = e.target.files?.[0];

        if (!file) {

            setReportFile(null);

            return;

        }

        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {

            alert(
                "Only PDF files are allowed."
            );

            e.target.value = "";

            setReportFile(null);

            return;

        }

        setReportFile(file);

    };

    // =========================================================
    // SUBMIT RESULT + PDF + COMPLETE
    // =========================================================

    const submitResult = async (e) => {

        e.preventDefault();

        if (!selectedTest) {

            alert(
                "Please select a test"
            );

            return;

        }

        if (!result.trim()) {

            alert(
                "Please enter the test result"
            );

            return;

        }

        if (!reportFile) {

            alert(
                "Please select the laboratory PDF report"
            );

            return;

        }

        try {

            setSaving(true);

            // =================================================
            // STEP 1: SAVE RESULT
            // =================================================

            await api.put(
                `/lab/test/${selectedTest.id}/result`,
                null,
                {
                    params: {
                        result: result.trim()
                    }
                }
            );

            // =================================================
            // STEP 2: UPLOAD PDF
            // =================================================

            const formData = new FormData();

            formData.append(
                "file",
                reportFile
            );

            await api.post(
                `/lab/test/${selectedTest.id}/report`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            // =================================================
            // STEP 3: COMPLETE TEST
            // =================================================

            await api.put(
                `/lab/test/${selectedTest.id}/complete`
            );

            alert(
                "Result, PDF report and test completion saved successfully."
            );

            // Clear form

            setSelectedTest(null);

            setResult("");

            setReportFile(null);

            // Reload tests

            await loadTests();

        } catch (error) {

            console.error(
                "Unable to process test:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            alert(
                error.response?.data ||
                "Unable to process laboratory test"
            );

        } finally {

            setSaving(false);

        }

    };

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
                        Process Test
                    </h1>

                    <p>
                        Process laboratory tests and
                        enter diagnostic results
                    </p>

                </div>

            </header>

            {/* =====================================================
                PROCESS LAYOUT
            ====================================================== */}

            <div className="process-layout">

                {/* =================================================
                    LEFT SIDE - TEST LIST
                ================================================== */}

                <section className="process-list-card">

                    <div className="lab-table-header">

                        <div>

                            <h2>
                                Tests to Process
                            </h2>

                            <span>
                                {tests.length} test(s)
                            </span>

                        </div>

                        <button
                            className="refresh-button"
                            onClick={loadTests}
                        >
                            ↻ Refresh
                        </button>

                    </div>

                    {loading ? (

                        <div className="lab-loading">

                            Loading tests...

                        </div>

                    ) : tests.length === 0 ? (

                        <div className="lab-empty small">

                            <div>
                                🔬
                            </div>

                            <h3>
                                No Tests Available
                            </h3>

                            <p>
                                There are currently no
                                tests being processed.
                            </p>

                        </div>

                    ) : (

                        <div className="process-test-list">

                            {tests.map(
                                (test) => (

                                    <div
                                        key={test.id}
                                        className={`process-test-item ${
                                            selectedTest?.id === test.id
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            selectTest(test)
                                        }
                                    >

                                        <div className="process-test-icon">
                                            🧪
                                        </div>

                                        <div className="process-test-info">

                                            <strong>
                                                {test.testName ||
                                                    "Diagnostic Test"}
                                            </strong>

                                            <span>
                                                Patient ID:{" "}
                                                {test.patient?.id ?? "-"}
                                            </span>

                                            <span>
                                                Patient:{" "}
                                                {test.patient?.fullName ?? "-"}
                                            </span>

                                            <span>
                                                Appointment:{" "}
                                                {test.appointment?.appointmentId ?? "-"}
                                            </span>

                                        </div>

                                        <span
                                            className={`status-badge ${String(
                                                test.status || ""
                                            ).toLowerCase()}`}
                                        >
                                            {test.status}
                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

                {/* =================================================
                    RIGHT SIDE - RESULT FORM
                ================================================== */}

                <section className="process-form-card">

                    {!selectedTest ? (

                        <div className="select-test-message">

                            <div>
                                🧪
                            </div>

                            <h2>
                                Select a Test
                            </h2>

                            <p>
                                Select a laboratory request
                                from the left to enter its
                                diagnostic result.
                            </p>

                        </div>

                    ) : (

                        <>

                            {/* Selected Test Header */}

                            <div className="selected-test-header">

                                <div>

                                    <span className="lab-small-label">
                                        SELECTED TEST
                                    </span>

                                    <h2>
                                        {selectedTest.testName ||
                                            "Diagnostic Test"}
                                    </h2>

                                </div>

                                <span
                                    className={`status-badge ${String(
                                        selectedTest.status || ""
                                    ).toLowerCase()}`}
                                >
                                    {selectedTest.status}
                                </span>

                            </div>

                            {/* =================================================
                                PATIENT INFORMATION
                            ================================================== */}

                            <div className="test-patient-info">

                                <div>

                                    <span>
                                        Patient ID
                                    </span>

                                    <strong>
                                        {selectedTest.patient?.id ?? "-"}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Patient Name
                                    </span>

                                    <strong>
                                        {selectedTest.patient?.fullName ?? "-"}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Appointment ID
                                    </span>

                                    <strong>
                                        {selectedTest.appointment?.appointmentId ?? "-"}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Category
                                    </span>

                                    <strong>
                                        {selectedTest.testCategory ??
                                            "OTHER"}
                                    </strong>

                                </div>

                            </div>

                            {/* =================================================
                                RESULT FORM
                            ================================================== */}

                            <form
                                className="lab-form"
                                onSubmit={submitResult}
                            >

                                {/* Test Result */}

                                <div className="form-group">

                                    <label>
                                        Test Result *
                                    </label>

                                    <textarea
                                        rows="7"
                                        placeholder="Enter complete laboratory test result..."
                                        value={result}
                                        onChange={(e) =>
                                            setResult(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                                {/* PDF REPORT */}

                                <div className="form-group">

                                    <label>
                                        Upload Laboratory Report *
                                    </label>

                                    <input
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        onChange={handleFileChange}
                                    />

                                    {reportFile && (

                                        <p
                                            style={{
                                                marginTop: "8px"
                                            }}
                                        >
                                            📄 Selected:{" "}
                                            <strong>
                                                {reportFile.name}
                                            </strong>
                                        </p>

                                    )}

                                </div>

                                {/* Information */}

                                <div className="result-warning">

                                    <span>
                                        ℹ️
                                    </span>

                                    <p>
                                        Verify the result and
                                        PDF report carefully
                                        before submitting.
                                        The completed result
                                        may be visible to the
                                        doctor and patient.
                                    </p>

                                </div>

                                {/* Submit */}

                                <button
                                    type="submit"
                                    className="lab-submit-button"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving Result & Uploading Report..."
                                        : "✓ Submit Result, Upload Report & Complete"}

                                </button>

                            </form>

                        </>

                    )}

                </section>

            </div>

        </div>

    );

};

export default ProcessTest;