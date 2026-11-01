import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./admin.css";

const HospitalOverview = () => {

    const navigate = useNavigate();

    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOverview();
    }, []);


    const loadOverview = async () => {

        try {

            setLoading(true);

            const response = await api.get("/admin/staff");

            setStaff(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error("Overview error:", error);

        } finally {

            setLoading(false);

        }
    };


    const countRole = (role) => {

        return staff.filter(
            (member) =>
                String(member.role || "").toUpperCase() === role
        ).length;

    };


    const countStatus = (status) => {

        return staff.filter(
            (member) =>
                String(member.status || "").toUpperCase() === status
        ).length;

    };


    return (

        <div className="admin-page">

            <div className="admin-page-header">

                <div>
                    <h1>Hospital Overview</h1>

                    <p>
                        Overall hospital operational overview
                    </p>
                </div>

                <button
                    className="back-button"
                    onClick={() => navigate("/admin")}
                >
                    ← Dashboard
                </button>

            </div>


            <div className="overview-header-card">

                <div className="overview-icon">
                    🏥
                </div>

                <div>

                    <h2>Thilak Hospital Overview</h2>

                    <p>
                        Monitor staff distribution and hospital
                        administrative operations.
                    </p>

                </div>

            </div>


            {/* STAFF BY ROLE */}

            <section className="admin-section">

                <div className="section-heading">

                    <div>
                        <h2>Staff Distribution</h2>

                        <p>
                            Number of staff members by role
                        </p>
                    </div>

                </div>


                <div className="overview-grid">

                    <div className="overview-card">
                        <span>👨‍⚕️</span>
                        <label>Doctors</label>
                        <strong>
                            {loading ? "..." : countRole("DOCTOR")}
                        </strong>
                    </div>


                    <div className="overview-card">
                        <span>👩‍⚕️</span>
                        <label>Nurses</label>
                        <strong>
                            {loading ? "..." : countRole("NURSE")}
                        </strong>
                    </div>


                    <div className="overview-card">
                        <span>🧾</span>
                        <label>Receptionists</label>
                        <strong>
                            {loading ? "..." : countRole("RECEPTIONIST")}
                        </strong>
                    </div>


                    <div className="overview-card">
                        <span>💊</span>
                        <label>Pharmacists</label>
                        <strong>
                            {loading ? "..." : countRole("PHARMACIST")}
                        </strong>
                    </div>


                    <div className="overview-card">
                        <span>🔬</span>
                        <label>Lab In-Charge</label>
                        <strong>
                            {loading ? "..." : countRole("LAB_INCHARGE")}
                        </strong>
                    </div>


                    <div className="overview-card">
                        <span>🛏️</span>
                        <label>Bed In-Charge</label>
                        <strong>
                            {loading ? "..." : countRole("BED_INCHARGE")}
                        </strong>
                    </div>

                </div>

            </section>


            {/* STAFF STATUS */}

            <section className="admin-section">

                <div className="section-heading">

                    <div>
                        <h2>Staff Account Status</h2>

                        <p>
                            Current staff account status
                        </p>
                    </div>

                </div>


                <div className="status-overview">

                    <div className="status-overview-card pending">

                        <span>Pending</span>

                        <strong>
                            {loading ? "..." : countStatus("PENDING")}
                        </strong>

                    </div>


                    <div className="status-overview-card approved">

                        <span>Active / Approved</span>

                        <strong>
                            {loading
                                ? "..."
                                : countStatus("APPROVED") +
                                  countStatus("ACTIVE")}
                        </strong>

                    </div>


                    <div className="status-overview-card rejected">

                        <span>Inactive / Rejected</span>

                        <strong>
                            {loading
                                ? "..."
                                : countStatus("INACTIVE") +
                                  countStatus("REJECTED")}
                        </strong>

                    </div>

                </div>

            </section>


            {/* ADMIN NOTE */}

            <section className="admin-section">

                <div className="overview-note">

                    <strong>Administrator Access</strong>

                    <p>
                        The administrator is responsible for monitoring
                        hospital operations, managing staff accounts,
                        approving registrations and viewing system-level
                        information. Operational medical activities remain
                        with their respective departments.
                    </p>

                </div>

            </section>

        </div>
    );
};

export default HospitalOverview;