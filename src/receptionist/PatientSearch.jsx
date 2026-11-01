import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./receptionist.css";

const PatientSearch = () => {
    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [search, setSearch] = useState("");
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");

    // =========================================================
    // SEARCH PATIENT
    // =========================================================

    const handleSearch = async (e) => {
        e.preventDefault();

        setError("");
        setPatients([]);
        setSearched(false);

        const value = search.trim();

        if (!value) {
            setError(
                "Please enter patient name, UHID or mobile number."
            );
            return;
        }

        try {
            setLoading(true);
            setSearched(true);

            let response;

            /*
             * Backend has 3 separate search APIs:
             *
             * UHID:
             * GET /receptionist/patient/uhid/{uhid}
             *
             * Mobile:
             * GET /receptionist/patient/mobile/{mobile}
             *
             * Name:
             * GET /receptionist/patient/name/{name}
             *
             * So we decide which API to call based on the
             * entered value.
             */

            if (/^\d{10}$/.test(value)) {

                // =============================================
                // MOBILE NUMBER SEARCH
                // =============================================

                response = await api.get(
                    `/receptionist/patient/mobile/${encodeURIComponent(
                        value
                    )}`
                );

            } else if (/^\d+$/.test(value)) {

                // =============================================
                // UHID SEARCH
                // =============================================

                response = await api.get(
                    `/receptionist/patient/uhid/${encodeURIComponent(
                        value
                    )}`
                );

            } else {

                // =============================================
                // NAME SEARCH
                // =============================================

                response = await api.get(
                    `/receptionist/patient/name/${encodeURIComponent(
                        value
                    )}`
                );
            }

            /*
             * Backend may return:
             *
             * single patient object
             * OR
             * list of patients
             *
             * Convert both formats into an array.
             */

            if (Array.isArray(response.data)) {
                setPatients(response.data);
            } else if (response.data) {
                setPatients([response.data]);
            } else {
                setPatients([]);
            }

        } catch (err) {

            console.error(
                "Patient search error:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            if (err.response?.status === 404) {

                setPatients([]);

                setError(
                    "Patient not found."
                );

            } else if (err.response?.data) {

                setError(
                    typeof err.response.data === "string"
                        ? err.response.data
                        : "Unable to search patients."
                );

            } else {

                setError(
                    "Unable to search patients."
                );
            }

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {
        clearAuth();
        navigate("/");
    };

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div className="receptionist-page">

            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <aside className="receptionist-sidebar">

                <div className="receptionist-logo">

                    <div className="receptionist-logo-icon">
                        +
                    </div>

                    <div>
                        <h2>Thilak Hospital</h2>

                        <span>
                            Receptionist Portal
                        </span>
                    </div>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav className="receptionist-nav">

                    <button
                        onClick={() =>
                            navigate("/receptionist")
                        }
                    >
                        <span>▣</span>
                        Dashboard
                    </button>


                    <button className="active">
                        <span>👥</span>
                        Patient Search
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/receptionist/appointments"
                            )
                        }
                    >
                        <span>📅</span>
                        Appointments
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/receptionist/walk-in"
                            )
                        }
                    >
                        <span>🚶</span>
                        Walk-In
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/receptionist/admissions"
                            )
                        }
                    >
                        <span>🏥</span>
                        Admissions
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/receptionist/billing"
                            )
                        }
                    >
                        <span>💳</span>
                        Billing
                    </button>

                </nav>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <button
                    className="receptionist-logout"
                    onClick={logout}
                >
                    ⇥ Logout
                </button>

            </aside>


            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <main className="receptionist-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="receptionist-header">

                    <div>

                        <p className="receptionist-label">
                            PATIENT MANAGEMENT
                        </p>

                        <h1>
                            Patient Search
                        </h1>

                        <p>
                            Find patients using their UHID,
                            name or mobile number.
                        </p>

                    </div>


                    <div className="receptionist-user">

                        <div className="receptionist-avatar">

                            {(user.name || "R")
                                .charAt(0)
                                .toUpperCase()}

                        </div>

                        <div>

                            <strong>
                                {user.name || "Receptionist"}
                            </strong>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    SEARCH SECTION
                ================================================= */}

                <section className="receptionist-section">

                    <form
                        className="patient-search-form"
                        onSubmit={handleSearch}
                    >

                        <div className="patient-search-input">

                            <span>
                                🔍
                            </span>

                            <input
                                type="text"
                                placeholder="Enter patient name, UHID or mobile number"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>


                        <button
                            type="submit"
                            className="receptionist-primary-btn"
                            disabled={loading}
                        >

                            {loading
                                ? "Searching..."
                                : "Search"}

                        </button>

                    </form>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                        <div className="receptionist-error">

                            {error}

                        </div>

                    )}


                    {/* =================================================
                        NO RESULTS
                    ================================================= */}

                    {searched &&
                        !loading &&
                        patients.length === 0 &&
                        !error && (

                            <div className="receptionist-empty">

                                No patient found.

                            </div>

                        )}


                    {/* =================================================
                        RESULTS
                    ================================================= */}

                    {patients.length > 0 && (

                        <div className="receptionist-table-wrapper">

                            <table className="receptionist-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            UHID
                                        </th>

                                        <th>
                                            Mobile
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Gender
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {patients.map(
                                        (patient, index) => (

                                            <tr
                                                key={
                                                    patient.id ||
                                                    patient.userId ||
                                                    index
                                                }
                                            >

                                                {/* PATIENT */}

                                                <td>

                                                    <div className="receptionist-patient-cell">

                                                        <div className="receptionist-small-avatar">

                                                            {(
                                                                patient.fullName ||
                                                                "P"
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}

                                                        </div>

                                                        <strong>

                                                            {patient.fullName ||
                                                                "Patient"}

                                                        </strong>

                                                    </div>

                                                </td>


                                                {/* UHID */}

                                                <td>

                                                    {patient.uhid ||
                                                        "-"}

                                                </td>


                                                {/* MOBILE */}

                                                <td>

                                                    {patient.mobile ||
                                                        "-"}

                                                </td>


                                                {/* EMAIL */}

                                                <td>

                                                    {patient.email ||
                                                        "-"}

                                                </td>


                                                {/* GENDER */}

                                                <td>

                                                    {patient.gender ||
                                                        "-"}

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    <button
                                                        className="receptionist-small-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/receptionist/patients/${patient.id}`
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

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

export default PatientSearch;