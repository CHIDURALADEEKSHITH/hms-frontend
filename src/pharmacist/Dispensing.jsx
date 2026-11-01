import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./pharmacist.css";

const Dispensing = () => {
    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        loadBills();
    }, []);

    // =========================================================
    // LOAD ALL PHARMACY BILLS
    // =========================================================

    const loadBills = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/pharmacist/bills");

            setBills(response.data || []);
        } catch (err) {
            console.error("Unable to load pharmacy bills:", err);

            setError(
                err.response?.data ||
                "Unable to load pharmacy bills."
            );
        } finally {
            setLoading(false);
        }
    };


    // =========================================================
    // MARK PAYMENT AS PAID
    // =========================================================

    const markAsPaid = async (billId) => {

        const confirmPayment = window.confirm(
            "Confirm that payment has been received?"
        );

        if (!confirmPayment) {
            return;
        }

        try {
            setProcessingId(billId);

            await api.put(
                `/pharmacist/bill/${billId}/payment`
            );

            alert("Payment completed successfully.");

            await loadBills();

        } catch (err) {
            console.error(
                "Unable to complete payment:",
                err
            );

            alert(
                err.response?.data ||
                "Unable to complete payment."
            );
        } finally {
            setProcessingId(null);
        }
    };


    // =========================================================
    // DISPENSE MEDICINE
    // =========================================================

    const dispenseMedicine = async (billId) => {

        const confirmDispense = window.confirm(
            "Confirm that the medicine has been dispensed to the patient?"
        );

        if (!confirmDispense) {
            return;
        }

        try {
            setProcessingId(billId);

            await api.put(
                `/pharmacist/bill/${billId}/dispense`
            );

            alert("Medicine dispensed successfully.");

            await loadBills();

        } catch (err) {
            console.error(
                "Unable to dispense medicine:",
                err
            );

            alert(
                err.response?.data ||
                "Unable to dispense medicine."
            );
        } finally {
            setProcessingId(null);
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
        <div className="pharmacist-page">

            {/* ================================================= */}
            {/* SIDEBAR */}
            {/* ================================================= */}

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
                        onClick={() =>
                            navigate("/pharmacist")
                        }
                    >
                        <span>▣</span>
                        Dashboard
                    </button>


                    <button
                        onClick={() =>
                            navigate("/pharmacist/prescriptions")
                        }
                    >
                        <span>💊</span>
                        Prescription Requests
                    </button>


                    <button
                        onClick={() =>
                            navigate("/pharmacist/billing")
                        }
                    >
                        <span>🧾</span>
                        Pharmacy Billing
                    </button>


                    <button className="active">
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


            {/* ================================================= */}
            {/* MAIN */}
            {/* ================================================= */}

            <main className="pharmacist-main">

                <header className="pharmacist-header">

                    <div>

                        <p className="pharmacist-label">
                            PHARMACY
                        </p>

                        <h1>Payment & Dispensing</h1>

                        <p>
                            Complete payment and dispense
                            prescribed medicines.
                        </p>

                    </div>

                </header>


                {/* ================================================= */}
                {/* BILL SECTION */}
                {/* ================================================= */}

                <section className="pharmacist-section">

                    <div className="pharmacist-section-heading">

                        <div>

                            <h2>
                                Pharmacy Bills
                            </h2>

                            <p>
                                Process payment and dispense
                                medicines for generated bills.
                            </p>

                        </div>


                        <button
                            className="pharmacist-small-btn"
                            onClick={loadBills}
                        >
                            Refresh
                        </button>

                    </div>


                    {/* ================================================= */}
                    {/* LOADING */}
                    {/* ================================================= */}

                    {loading && (

                        <div className="pharmacist-empty">
                            Loading pharmacy bills...
                        </div>

                    )}


                    {/* ================================================= */}
                    {/* ERROR */}
                    {/* ================================================= */}

                    {!loading && error && (

                        <div className="pharmacist-error">
                            {error}
                        </div>

                    )}


                    {/* ================================================= */}
                    {/* NO BILLS */}
                    {/* ================================================= */}

                    {!loading &&
                        !error &&
                        bills.length === 0 && (

                            <div className="pharmacist-empty">
                                No pharmacy bills available.
                            </div>

                        )}


                    {/* ================================================= */}
                    {/* TABLE */}
                    {/* ================================================= */}

                    {!loading &&
                        !error &&
                        bills.length > 0 && (

                            <div className="pharmacist-table-wrapper">

                                <table className="pharmacist-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Bill ID
                                            </th>

                                            <th>
                                                Bill Number
                                            </th>

                                            <th>
                                                Patient ID
                                            </th>

                                            <th>
                                                Prescription
                                            </th>

                                            <th>
                                                Medicine
                                            </th>

                                            <th>
                                                Quantity
                                            </th>

                                            <th>
                                                Price / Tablet
                                            </th>

                                            <th>
                                                Total
                                            </th>

                                            <th>
                                                Payment
                                            </th>

                                            <th>
                                                Dispensing
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {bills.map((bill) => {

                                            const paymentStatus =
                                                String(
                                                    bill.paymentStatus || "PENDING"
                                                ).toUpperCase();

                                            const dispensingStatus =
                                                String(
                                                    bill.dispensingStatus || "PENDING"
                                                ).toUpperCase();

                                            const isPaid =
                                                paymentStatus === "PAID";

                                            const isDispensed =
                                                dispensingStatus === "DISPENSED";

                                            const isProcessing =
                                                processingId === bill.id;


                                            return (

                                                <tr key={bill.id}>

                                                    {/* BILL ID */}

                                                    <td>
                                                        #{bill.id}
                                                    </td>


                                                    {/* BILL NUMBER */}

                                                    <td>
                                                        {bill.billNumber || "-"}
                                                    </td>


                                                    {/* PATIENT */}

                                                    <td>
                                                        {bill.patient?.id || "-"}
                                                    </td>


                                                    {/* PRESCRIPTION */}

                                                    <td>
                                                        {bill.prescription?.id || "-"}
                                                    </td>


                                                    {/* MEDICINE */}

                                                    <td>
                                                        {bill.medicineName || "-"}
                                                    </td>


                                                    {/* QUANTITY */}

                                                    <td>
                                                        {bill.quantity || 0}
                                                    </td>


                                                    {/* PRICE */}

                                                    <td>
                                                        ₹
                                                        {Number(
                                                            bill.pricePerTablet || 0
                                                        ).toFixed(2)}
                                                    </td>


                                                    {/* TOTAL */}

                                                    <td>
                                                        <strong>
                                                            ₹
                                                            {Number(
                                                                bill.totalAmount || 0
                                                            ).toFixed(2)}
                                                        </strong>
                                                    </td>


                                                    {/* PAYMENT STATUS */}

                                                    <td>

                                                        <span className="pharmacist-status">
                                                            {paymentStatus}
                                                        </span>

                                                    </td>


                                                    {/* DISPENSING STATUS */}

                                                    <td>

                                                        <span className="pharmacist-status">
                                                            {dispensingStatus}
                                                        </span>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        {!isPaid && !isDispensed && (

                                                            <button
                                                                className="pharmacist-small-btn"
                                                                disabled={isProcessing}
                                                                onClick={() =>
                                                                    markAsPaid(
                                                                        bill.id
                                                                    )
                                                                }
                                                            >
                                                                {isProcessing
                                                                    ? "Processing..."
                                                                    : "Mark as Paid"}
                                                            </button>

                                                        )}


                                                        {isPaid && !isDispensed && (

                                                            <button
                                                                className="pharmacist-small-btn"
                                                                disabled={isProcessing}
                                                                onClick={() =>
                                                                    dispenseMedicine(
                                                                        bill.id
                                                                    )
                                                                }
                                                            >
                                                                {isProcessing
                                                                    ? "Processing..."
                                                                    : "Dispense Medicine"}
                                                            </button>

                                                        )}


                                                        {isPaid && isDispensed && (

                                                            <span>
                                                                ✓ Completed
                                                            </span>

                                                        )}

                                                    </td>

                                                </tr>

                                            );
                                        })}

                                    </tbody>

                                </table>

                            </div>

                        )}

                </section>

            </main>

        </div>
    );
};

export default Dispensing;