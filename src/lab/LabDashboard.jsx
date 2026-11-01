import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./lab.css";

const LabDashboard = () => {

    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const [stats, setStats] = useState({
        pending: 0,
        processing: 0,
        completed: 0,
        reports: 0
    });

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );


    // =========================================================
    // LOAD LAB DASHBOARD
    // =========================================================

    useEffect(() => {
        loadDashboard();
    }, []);


    const loadDashboard = async () => {

        try {

            // Backend endpoint:
            // GET /lab/tests

            const response = await api.get(
                "/lab/tests"
            );

            const tests = Array.isArray(response.data)
                ? response.data
                : [];


            console.log(
                "Lab tests:",
                tests
            );


            setStats({

                // Backend uses PENDING
                pending: tests.filter(
                    item =>
                        item.status === "PENDING"
                ).length,


                // Backend uses IN_PROGRESS
                processing: tests.filter(
                    item =>
                        item.status === "IN_PROGRESS"
                ).length,


                // Backend uses COMPLETED
                completed: tests.filter(
                    item =>
                        item.status === "COMPLETED"
                ).length,


                // Uploaded report is stored as reportFilePath
                reports: tests.filter(
                    item =>
                        item.reportFilePath
                ).length

            });


        } catch (error) {

            console.error(
                "Unable to load lab dashboard:",
                error
            );

        }

    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {
        clearAuth();
        navigate("/");
    };


    return (

        <div className="lab-layout">


            {/* =====================================================
                SIDEBAR
            ====================================================== */}

            <aside className="lab-sidebar">


                <div className="lab-logo">

                    <div className="lab-logo-icon">
                        🏥
                    </div>

                    <div>

                        <h2>
                            Thilak Hospital
                        </h2>

                        <span>
                            Laboratory
                        </span>

                    </div>

                </div>


                <nav className="lab-nav">


                    {/* Dashboard */}

                    <button
                        className="lab-nav-item active"
                        onClick={() =>
                            navigate("/lab")
                        }
                    >
                        📊 Dashboard
                    </button>


                    {/* Pending Tests */}

                    <button
                        className="lab-nav-item"
                        onClick={() =>
                            navigate("/lab/pending")
                        }
                    >
                        🧪 Pending Tests
                    </button>


                    {/* Process Test */}

                    <button
                        className="lab-nav-item"
                        onClick={() =>
                            navigate("/lab/process")
                        }
                    >
                        ⚙️ Process Test
                    </button>


                    {/* Test Results */}

                    <button
                        className="lab-nav-item"
                        onClick={() =>
                            navigate("/lab/results")
                        }
                    >
                        📋 Test Results
                    </button>


                    {/* Reports */}

                    <button
                        className="lab-nav-item"
                        onClick={() =>
                            navigate("/lab/reports")
                        }
                    >
                        📄 Reports
                    </button>


                </nav>


                {/* Logout */}

                <div className="lab-sidebar-bottom">

                    <button
                        className="lab-nav-item logout"
                        onClick={logout}
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* =====================================================
                MAIN CONTENT
            ====================================================== */}

            <main className="lab-main">


                {/* =================================================
                    HEADER
                ================================================== */}

                <header className="lab-header">


                    <div>

                        <h1>
                            Laboratory Dashboard
                        </h1>

                        <p>
                            Manage diagnostic tests and laboratory reports
                        </p>

                    </div>


                    {/* Lab User */}

                    <div className="lab-user-info">


                        <div className="lab-user-avatar">

                            {
                                user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "L"
                            }

                        </div>


                        <div>

                            <strong>
                                {
                                    user?.name ||
                                    "Lab In-Charge"
                                }
                            </strong>

                            <span>
                                Lab In-Charge
                            </span>

                        </div>


                    </div>

                </header>


                {/* =================================================
                    STATISTICS
                ================================================== */}

                <section className="lab-stats">


                    {/* Pending */}

                    <div className="lab-stat-card">

                        <div className="lab-stat-icon pending">
                            🧪
                        </div>

                        <div>

                            <span>
                                Pending Tests
                            </span>

                            <h2>
                                {stats.pending}
                            </h2>

                        </div>

                    </div>


                    {/* Processing */}

                    <div className="lab-stat-card">

                        <div className="lab-stat-icon processing">
                            ⚙️
                        </div>

                        <div>

                            <span>
                                Processing
                            </span>

                            <h2>
                                {stats.processing}
                            </h2>

                        </div>

                    </div>


                    {/* Completed */}

                    <div className="lab-stat-card">

                        <div className="lab-stat-icon completed">
                            ✓
                        </div>

                        <div>

                            <span>
                                Completed
                            </span>

                            <h2>
                                {stats.completed}
                            </h2>

                        </div>

                    </div>


                    {/* Reports */}

                    <div className="lab-stat-card">

                        <div className="lab-stat-icon reports">
                            📄
                        </div>

                        <div>

                            <span>
                                Reports
                            </span>

                            <h2>
                                {stats.reports}
                            </h2>

                        </div>

                    </div>


                </section>


                {/* =================================================
                    WELCOME CARD
                ================================================== */}

                <section className="lab-welcome-card">


                    <div>

                        <span className="lab-small-label">
                            LABORATORY MANAGEMENT
                        </span>


                        <h2>
                            Diagnostic Test Management
                        </h2>


                        <p>
                            Process laboratory requests,
                            enter test results, upload PDF
                            reports, and complete diagnostic
                            tests from one place.
                        </p>

                    </div>


                    <div className="lab-welcome-icon">
                        🔬
                    </div>


                </section>


                {/* =================================================
                    QUICK ACTIONS
                ================================================== */}

                <section className="lab-action-section">


                    <h2>
                        Quick Actions
                    </h2>


                    <div className="lab-action-grid">


                        {/* Pending Tests */}

                        <div
                            className="lab-action-card"
                            onClick={() =>
                                navigate("/lab/pending")
                            }
                        >

                            <div className="action-icon">
                                🧪
                            </div>


                            <h3>
                                Pending Tests
                            </h3>


                            <p>
                                View laboratory tests
                                waiting for processing.
                            </p>


                            <button>
                                View Tests →
                            </button>

                        </div>


                        {/* Process Test */}

                        <div
                            className="lab-action-card"
                            onClick={() =>
                                navigate("/lab/process")
                            }
                        >

                            <div className="action-icon">
                                ⚙️
                            </div>


                            <h3>
                                Process Test
                            </h3>


                            <p>
                                Start and update laboratory
                                test processing.
                            </p>


                            <button>
                                Process Test →
                            </button>

                        </div>


                        {/* Results */}

                        <div
                            className="lab-action-card"
                            onClick={() =>
                                navigate("/lab/results")
                            }
                        >

                            <div className="action-icon">
                                📋
                            </div>


                            <h3>
                                Test Results
                            </h3>


                            <p>
                                Enter and manage laboratory
                                test results.
                            </p>


                            <button>
                                View Results →
                            </button>

                        </div>


                        {/* Reports */}

                        <div
                            className="lab-action-card"
                            onClick={() =>
                                navigate("/lab/reports")
                            }
                        >

                            <div className="action-icon">
                                📄
                            </div>


                            <h3>
                                Reports
                            </h3>


                            <p>
                                Upload, view and download
                                laboratory PDF reports.
                            </p>


                            <button>
                                View Reports →
                            </button>

                        </div>


                    </div>

                </section>


            </main>

        </div>

    );

};

export default LabDashboard;