import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./pharmacist.css";

const PharmacistDashboard = () => {
    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const pharmacistId = user.userId;

    const [prescriptions, setPrescriptions] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [
                prescriptionsResponse,
                billsResponse
            ] = await Promise.all([
                api.get("/pharmacist/prescriptions"),
                api.get("/pharmacist/bills")
            ]);

            setPrescriptions(
                prescriptionsResponse.data || []
            );

            setBills(
                billsResponse.data || []
            );

        } catch (error) {
            console.error(
                "Pharmacist dashboard error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const pendingPrescriptions = prescriptions.filter(
        (item) =>
            String(
                item.status || "PENDING"
            ).toUpperCase() === "PENDING"
    ).length;

    const dispensedCount = bills.filter(
        (bill) =>
            String(
                bill.dispensingStatus || ""
            ).toUpperCase() === "DISPENSED"
    ).length;

    const totalSales = bills
        .filter(
            (bill) =>
                String(
                    bill.paymentStatus || ""
                ).toUpperCase() === "PAID"
        )
        .reduce(
            (total, bill) =>
                total +
                Number(bill.totalAmount || 0),
            0
        );

    const logout = () => {
        clearAuth();
        navigate("/");
    };

    return (
        <div className="pharmacist-page">

            {/* SIDEBAR */}
            <aside className="pharmacist-sidebar">

                <div className="pharmacist-logo">

                    <div className="pharmacist-logo-icon">
                        +
                    </div>

                    <div>
                        <h2>Thilak Hospital</h2>
                        <span>Pharmacy Portal</span>
                    </div>

                </div>

                <nav className="pharmacist-nav">

                    <button
                        className="active"
                        onClick={() =>
                            navigate("/pharmacist")
                        }
                    >
                        <span>▣</span>
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/pharmacist/prescriptions"
                            )
                        }
                    >
                        <span>💊</span>
                        Prescription Requests
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/pharmacist/billing"
                            )
                        }
                    >
                        <span>🧾</span>
                        Pharmacy Billing
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/pharmacist/dispensing"
                            )
                        }
                    >
                        <span>💉</span>
                        Dispensing
                    </button>

                </nav>

                <button
                    className="pharmacist-logout"
                    onClick={logout}
                >
                    ⇥ Logout
                </button>

            </aside>

            {/* MAIN */}
            <main className="pharmacist-main">

                {/* HEADER */}
                <header className="pharmacist-header">

                    <div>

                        <p className="pharmacist-label">
                            PHARMACY MANAGEMENT
                        </p>

                        <h1>
                            Welcome,{" "}
                            {user.name || "Pharmacist"}
                        </h1>

                        <p>
                            Manage prescriptions, billing
                            and dispensing.
                        </p>

                    </div>

                    <div className="pharmacist-user">

                        <div className="pharmacist-avatar">
                            {(user.name || "P")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>

                            <strong>
                                {user.name || "Pharmacist"}
                            </strong>

                            <span>
                                ID: {pharmacistId || "-"}
                            </span>

                        </div>

                    </div>

                </header>

                {/* STATISTICS */}
                <section className="pharmacist-stats">

                    <div className="pharmacist-stat-card">

                        <div className="pharmacist-stat-icon blue">
                            💊
                        </div>

                        <div>
                            <span>
                                Total Prescriptions
                            </span>

                            <strong>
                                {prescriptions.length}
                            </strong>
                        </div>

                    </div>

                    <div className="pharmacist-stat-card">

                        <div className="pharmacist-stat-icon orange">
                            ⏳
                        </div>

                        <div>
                            <span>
                                Pending Requests
                            </span>

                            <strong>
                                {pendingPrescriptions}
                            </strong>
                        </div>

                    </div>

                    <div className="pharmacist-stat-card">

                        <div className="pharmacist-stat-icon red">
                            ✓
                        </div>

                        <div>
                            <span>
                                Dispensed
                            </span>

                            <strong>
                                {dispensedCount}
                            </strong>
                        </div>

                    </div>

                    <div className="pharmacist-stat-card">

                        <div className="pharmacist-stat-icon green">
                            ₹
                        </div>

                        <div>
                            <span>
                                Total Sales
                            </span>

                            <strong>
                                ₹{totalSales.toFixed(2)}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* SERVICES */}
                <section className="pharmacist-section">

                    <div className="pharmacist-section-heading">

                        <div>

                            <h2>
                                Pharmacy Services
                            </h2>

                            <p>
                                Quickly access pharmacy
                                operations.
                            </p>

                        </div>

                    </div>

                    <div className="pharmacist-action-grid">

                        <button
                            className="pharmacist-action-card"
                            onClick={() =>
                                navigate(
                                    "/pharmacist/prescriptions"
                                )
                            }
                        >

                            <div className="pharmacist-action-icon">
                                💊
                            </div>

                            <h3>
                                Prescription Requests
                            </h3>

                            <p>
                                Check prescriptions received
                                from doctors.
                            </p>

                        </button>

                        <button
                            className="pharmacist-action-card"
                            onClick={() =>
                                navigate(
                                    "/pharmacist/billing"
                                )
                            }
                        >

                            <div className="pharmacist-action-icon">
                                🧾
                            </div>

                            <h3>
                                Pharmacy Billing
                            </h3>

                            <p>
                                Create and manage pharmacy
                                bills.
                            </p>

                        </button>

                        <button
                            className="pharmacist-action-card"
                            onClick={() =>
                                navigate(
                                    "/pharmacist/dispensing"
                                )
                            }
                        >

                            <div className="pharmacist-action-icon">
                                💉
                            </div>

                            <h3>
                                Dispensing
                            </h3>

                            <p>
                                Dispense medicines after
                                payment.
                            </p>

                        </button>

                    </div>

                </section>

                {/* RECENT PRESCRIPTIONS */}
                <section className="pharmacist-section">

                    <div className="pharmacist-section-heading">

                        <div>

                            <h2>
                                Recent Prescription Requests
                            </h2>

                            <p>
                                Latest prescriptions received
                                from doctors.
                            </p>

                        </div>

                        <button
                            className="pharmacist-view-btn"
                            onClick={() =>
                                navigate(
                                    "/pharmacist/prescriptions"
                                )
                            }
                        >
                            View All
                        </button>

                    </div>

                    {loading ? (

                        <div className="pharmacist-empty">
                            Loading...
                        </div>

                    ) : prescriptions.length === 0 ? (

                        <div className="pharmacist-empty">
                            No prescription requests
                            available.
                        </div>

                    ) : (

                        <div className="pharmacist-table-wrapper">

                            <table className="pharmacist-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Prescription ID
                                        </th>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            Medicine
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {prescriptions
                                        .slice(0, 5)
                                        .map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        item.id ||
                                                        index
                                                    }
                                                >

                                                    <td>
                                                        #
                                                        {
                                                            item.id ||
                                                            item.prescriptionId ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>

                                                        <strong>

                                                            {
                                                                item.patient
                                                                    ?.fullName ||
                                                                item.patientName ||
                                                                item.patient
                                                                    ?.id ||
                                                                "Patient"
                                                            }

                                                        </strong>

                                                    </td>

                                                    <td>
                                                        {
                                                            item.medicineName ||
                                                            item.medicine ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.date ||
                                                            item.prescriptionDate ||
                                                            item.prescribedDate ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td>

                                                        <span className="pharmacist-status">

                                                            {
                                                                item.status ||
                                                                "PENDING"
                                                            }

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

export default PharmacistDashboard;