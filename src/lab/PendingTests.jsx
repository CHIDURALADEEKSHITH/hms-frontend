import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./lab.css";

const PendingTests = () => {

    const navigate = useNavigate();

    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("ALL");

    // =========================================================
    // LOAD PENDING TESTS
    // =========================================================

    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/lab/tests/pending"
            );

            console.log(
                "Pending laboratory tests:",
                response.data
            );

            setTests(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Unable to load pending tests:",
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
    // START PROCESSING
    // =========================================================

    const startProcessing = async (id) => {

        try {

            await api.put(
                `/lab/test/${id}/process`
            );

            alert("Test processing started");

            loadTests();

        } catch (error) {

            console.error(
                "Unable to start test:",
                error
            );

            alert(
                error.response?.data ||
                "Unable to start test processing"
            );

        }

    };

    // =========================================================
    // FILTER TESTS
    // =========================================================

    const filteredTests = tests.filter((test) => {

        const searchValue =
            search.toLowerCase().trim();

        const patientId =
            String(test.patient?.id || "");

        const patientName =
            String(test.patient?.fullName || "");

        const appointmentId =
            String(test.appointment?.appointmentId || "");

        const testName =
            String(test.testName || "");

        const testCategory =
            String(test.testCategory || "");

        const testId =
            String(test.id || "");

        const matchesSearch =
            testId.toLowerCase().includes(searchValue) ||
            patientId.toLowerCase().includes(searchValue) ||
            patientName.toLowerCase().includes(searchValue) ||
            appointmentId.toLowerCase().includes(searchValue) ||
            testName.toLowerCase().includes(searchValue) ||
            testCategory.toLowerCase().includes(searchValue);

        const matchesCategory =
            category === "ALL" ||
            test.testCategory === category;

        return (
            matchesSearch &&
            matchesCategory
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
                        Pending Tests
                    </h1>

                    <p>
                        Laboratory requests that are ready
                        for processing
                    </p>

                </div>

                <button
                    className="refresh-button"
                    onClick={loadTests}
                >
                    ↻ Refresh
                </button>

            </header>

            {/* =====================================================
                SEARCH + CATEGORY FILTER
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

                <select
                    value={category}
                    onChange={(e) =>
                        setCategory(e.target.value)
                    }
                >

                    <option value="ALL">
                        All Categories
                    </option>

                    <option value="PATHOLOGY">
                        Pathology
                    </option>

                    <option value="CARDIAC">
                        Cardiac
                    </option>

                    <option value="RADIOLOGY">
                        Radiology
                    </option>

                    <option value="URINE">
                        Urine
                    </option>

                    <option value="THYROID">
                        Thyroid
                    </option>

                    <option value="VITAMIN">
                        Vitamin
                    </option>

                    <option value="OTHER">
                        Other
                    </option>

                </select>

            </div>

            {/* =====================================================
                TABLE
            ====================================================== */}

            <div className="lab-table-card">

                <div className="lab-table-header">

                    <div>

                        <h2>
                            Pending Laboratory Requests
                        </h2>

                        <span>
                            {filteredTests.length} test(s)
                        </span>

                    </div>

                </div>

                {/* Loading */}

                {loading ? (

                    <div className="lab-loading">
                        Loading laboratory requests...
                    </div>

                ) : filteredTests.length === 0 ? (

                    /* Empty */

                    <div className="lab-empty">

                        <div>
                            🔬
                        </div>

                        <h3>
                            No Pending Tests
                        </h3>

                        <p>
                            There are currently no laboratory
                            tests waiting for processing.
                        </p>

                    </div>

                ) : (

                    /* Table */

                    <div className="table-wrapper">

                        <table className="lab-table">

                            <thead>

                                <tr>

                                    <th>
                                        Request ID
                                    </th>

                                    <th>
                                        Patient ID
                                    </th>

                                    <th>
                                        Patient Name
                                    </th>

                                    <th>
                                        Appointment
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
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredTests.map(
                                    (test) => (

                                        <tr
                                            key={test.id}
                                        >

                                            {/* Request ID */}

                                            <td>

                                                <strong>
                                                    #{test.id}
                                                </strong>

                                            </td>

                                            {/* Patient ID */}

                                            <td>

                                                {test.patient?.id ?? "-"}

                                            </td>

                                            {/* Patient Name */}

                                            <td>

                                                {test.patient?.fullName ?? "-"}

                                            </td>

                                            {/* Appointment */}

                                            <td>

                                                {test.appointment?.appointmentId ??
                                                    "-"}

                                            </td>

                                            {/* Test */}

                                            <td>

                                                {test.testName ?? "-"}

                                            </td>

                                            {/* Category */}

                                            <td>

                                                <span className="category-badge">

                                                    {test.testCategory ??
                                                        "OTHER"}

                                                </span>

                                            </td>

                                            {/* Status */}

                                            <td>

                                                <span
                                                    className={`status-badge ${String(
                                                        test.status || "PENDING"
                                                    ).toLowerCase()}`}
                                                >

                                                    {test.status ||
                                                        "PENDING"}

                                                </span>

                                            </td>

                                            {/* Action */}

                                            <td>

                                                <button
                                                    className="table-action primary"
                                                    onClick={() =>
                                                        startProcessing(
                                                            test.id
                                                        )
                                                    }
                                                >
                                                    Start Test
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

export default PendingTests;