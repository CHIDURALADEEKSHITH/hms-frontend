import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./admin.css";

const BillingManagement = () => {

    const navigate = useNavigate();

    const [bills, setBills] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadBills();
    }, []);

    // LOAD ALL HOSPITAL BILLS
    const loadBills = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/admin/billing");

            setBills(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error("Unable to load bills:", err);

            setBills([]);

            setError(
                err.response?.data ||
                "Unable to load billing information."
            );

        } finally {

            setLoading(false);

        }
    };

    // FILTER BILLS
    const filteredBills = bills.filter((bill) => {

        const value = search.toLowerCase();

        const patientName =
            bill.patient?.fullName || "";

        const patientId =
            bill.patient?.id || "";

        const uhid =
            bill.patient?.uhid || "";

        return (
            String(bill.id || "").toLowerCase().includes(value) ||
            String(bill.billNumber || "").toLowerCase().includes(value) ||
            String(patientName).toLowerCase().includes(value) ||
            String(patientId).toLowerCase().includes(value) ||
            String(uhid).toLowerCase().includes(value) ||
            String(bill.paymentStatus || "").toLowerCase().includes(value)
        );

    });

    // CALCULATE REVENUE
    const calculateTotal = () => {

        return filteredBills.reduce(
            (total, bill) =>
                total + Number(bill.totalAmount || 0),
            0
        );

    };

    // GET PATIENT DISPLAY
    const getPatientName = (bill) => {

        if (bill.patient?.fullName) {
            return bill.patient.fullName;
        }

        if (bill.patient?.uhid) {
            return bill.patient.uhid;
        }

        if (bill.patient?.id) {
            return `Patient ID: ${bill.patient.id}`;
        }

        return "Not Available";
    };

    return (

        <div className="admin-page">

            <div className="admin-page-header">

                <div>
                    <h1>Billing Management</h1>

                    <p>
                        Monitor hospital billing and revenue
                    </p>
                </div>

                <button
                    className="back-button"
                    onClick={() => navigate("/admin")}
                >
                    ← Dashboard
                </button>

            </div>

            {/* BILLING SUMMARY */}

            <div className="billing-summary">

                <div className="billing-summary-card">

                    <span>Total Bills</span>

                    <strong>
                        {filteredBills.length}
                    </strong>

                </div>

                <div className="billing-summary-card">

                    <span>Total Revenue</span>

                    <strong>
                        ₹{calculateTotal().toLocaleString("en-IN")}
                    </strong>

                </div>

            </div>

            {/* SEARCH AND REFRESH */}

            <div className="admin-toolbar">

                <div className="search-box">

                    <span>🔍</span>

                    <input
                        type="text"
                        placeholder="Search bills, patients or UHID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

                <button
                    className="refresh-button"
                    onClick={loadBills}
                >
                    ↻ Refresh
                </button>

            </div>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            {/* HOSPITAL BILLS TABLE */}

            <div className="admin-table-card">

                <div className="table-header">

                    <div>
                        <h2>Hospital Bills</h2>
                    </div>

                </div>

                {loading ? (

                    <div className="admin-loading">
                        Loading billing information...
                    </div>

                ) : filteredBills.length === 0 ? (

                    <div className="admin-empty">

                        <div className="empty-icon">
                            ₹
                        </div>

                        <h3>No Billing Records</h3>

                        <p>
                            No billing records are currently available.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>
                                    <th>Bill ID</th>
                                    <th>Patient</th>
                                    <th>Patient ID</th>
                                    <th>Amount</th>
                                    <th>Payment Status</th>
                                    <th>Date</th>
                                </tr>

                            </thead>

                            <tbody>

                                {filteredBills.map((bill) => (

                                    <tr key={bill.id}>

                                        <td>
                                            <strong>
                                                {bill.id}
                                            </strong>
                                        </td>

                                        <td>
                                            {getPatientName(bill)}
                                        </td>

                                        <td>
                                            {bill.patient?.id || "-"}
                                        </td>

                                        <td>
                                            ₹
                                            {Number(
                                                bill.totalAmount || 0
                                            ).toLocaleString("en-IN")}
                                        </td>

                                        <td>

                                            <span className="status-badge status-approved">
                                                {bill.paymentStatus || "UNKNOWN"}
                                            </span>

                                        </td>

                                        <td>
                                            {bill.billDate
                                                ? new Date(bill.billDate).toLocaleString("en-IN")
                                                : "-"}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );
};

export default BillingManagement;