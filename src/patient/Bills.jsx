import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./patient.css";

const Bills = () => {

    const navigate = useNavigate();
    const { logout: clearAuth } = useAuth();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const patientId = user.userId;

    // Hospital bills
    const [bills, setBills] = useState([]);

    // Pharmacy bills
    const [pharmacyBills, setPharmacyBills] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // LOAD HOSPITAL + PHARMACY BILLS
    // =========================================================
    useEffect(() => {

        if (patientId) {
            loadBills();
        } else {
            setError(
                "Patient information not found. Please login again."
            );
            setLoading(false);
        }

    }, [patientId]);


    const loadBills = async () => {

        try {

            setLoading(true);
            setError("");

            // Load both types of bills
            const [
                hospitalResponse,
                pharmacyResponse
            ] = await Promise.all([

                api.get(
                    `/patient/${patientId}/hospital-bills`
                ),

                api.get(
                    `/patient/${patientId}/pharmacy-bills`
                )

            ]);


            console.log(
                "Hospital bills:",
                hospitalResponse.data
            );

            console.log(
                "Pharmacy bills:",
                pharmacyResponse.data
            );


            // Hospital bills
            const hospitalData =
                Array.isArray(hospitalResponse.data)
                    ? hospitalResponse.data
                    : [];


            // Pharmacy bills
            const pharmacyData =
                Array.isArray(pharmacyResponse.data)
                    ? pharmacyResponse.data
                    : [];


            setBills(hospitalData);

            setPharmacyBills(pharmacyData);


        } catch (err) {

            console.error(
                "Unable to load bills:",
                err
            );

            console.error(
                "Backend response:",
                err.response?.data
            );

            setError(
                "Unable to load billing records."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // COMBINE BOTH TYPES OF BILLS FOR SUMMARY
    // =========================================================

    const allBills = [
        ...bills,
        ...pharmacyBills
    ];


    // Total amount
    const totalAmount = allBills.reduce(
        (sum, bill) =>
            sum + Number(
                bill.totalAmount || 0
            ),
        0
    );


    // Paid bills
    const paidBills = allBills.filter(
        (bill) =>
            bill.paymentStatus === "PAID"
    ).length;


    // =========================================================
    // HOSPITAL BILL TYPE
    // =========================================================

    const getBillType = (bill) => {

        if (
            Number(
                bill.consultationCharges || 0
            ) > 0
        ) {
            return "Consultation";
        }

        if (
            Number(
                bill.registrationCharges || 0
            ) > 0
        ) {
            return "Registration";
        }

        if (
            Number(
                bill.laboratoryCharges || 0
            ) > 0
        ) {
            return "Laboratory";
        }

        if (
            Number(
                bill.admissionCharges || 0
            ) > 0
        ) {
            return "Admission";
        }

        if (
            Number(
                bill.roomCharges || 0
            ) > 0
        ) {
            return "Room / Bed";
        }

        if (
            Number(
                bill.otherCharges || 0
            ) > 0
        ) {
            return "Other Service";
        }

        return "Hospital Service";

    };


    // =========================================================
    // DOCTOR NAME
    // =========================================================

    const getDoctorName = (bill) => {

        if (
            bill.doctor?.fullName
        ) {
            return bill.doctor.fullName;
        }

        return "Not Available";

    };


    // =========================================================
    // BILL DATE
    // =========================================================

    const getBillDate = (bill) => {

        if (!bill.billDate) {
            return "-";
        }

        return new Date(
            bill.billDate
        ).toLocaleString();

    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {
        clearAuth();
        navigate("/");
    };


    return (

        <div className="patient-page">

            {/* =====================================================
                SIDEBAR
            ====================================================== */}

            <aside className="patient-sidebar">

                <div className="patient-logo">

                    <div className="patient-logo-icon">
                        +
                    </div>

                    <div>

                        <h2>Thilak Hospital</h2>

                        <span>
                            Patient Portal
                        </span>

                    </div>

                </div>


                <nav className="patient-nav">

                    <button
                        onClick={() =>
                            navigate("/patient")
                        }
                    >
                        <span>▣</span>
                        Dashboard
                    </button>


                    <button
                        onClick={() =>
                            navigate("/patient/profile")
                        }
                    >
                        <span>👤</span>
                        My Profile
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/patient/book-appointment"
                            )
                        }
                    >
                        <span>📅</span>
                        Book Appointment
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/patient/appointments"
                            )
                        }
                    >
                        <span>🗓</span>
                        My Appointments
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/patient/medical-history"
                            )
                        }
                    >
                        <span>📋</span>
                        Medical History
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/patient/prescriptions"
                            )
                        }
                    >
                        <span>💊</span>
                        Prescriptions
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/patient/lab-reports"
                            )
                        }
                    >
                        <span>🧪</span>
                        Lab Reports
                    </button>


                    <button className="active">

                        <span>💳</span>

                        Bills & Payments

                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/patient/admission"
                            )
                        }
                    >
                        <span>🏥</span>
                        Admission
                    </button>

                </nav>


                <button
                    className="patient-logout"
                    onClick={logout}
                >
                    ⇥ Logout
                </button>

            </aside>


            {/* =====================================================
                MAIN CONTENT
            ====================================================== */}

            <main className="patient-main">

                {/* HEADER */}

                <header className="patient-header">

                    <div>

                        <p className="patient-label">
                            FINANCIAL RECORDS
                        </p>

                        <h1>
                            Bills & Payments
                        </h1>

                        <p>
                            View your hospital bills,
                            pharmacy bills, payment
                            status and billing details.
                        </p>

                    </div>

                </header>


                {/* =================================================
                    SUMMARY CARDS
                ================================================== */}

                <section className="patient-stats-grid">

                    {/* Total Bills */}

                    <div className="patient-stat-card">

                        <div className="patient-stat-icon">
                            💳
                        </div>

                        <div>

                            <p>
                                Total Bills
                            </p>

                            <h2>
                                {allBills.length}
                            </h2>

                        </div>

                    </div>


                    {/* Total Amount */}

                    <div className="patient-stat-card">

                        <div className="patient-stat-icon">
                            ₹
                        </div>

                        <div>

                            <p>
                                Total Amount
                            </p>

                            <h2>
                                ₹
                                {totalAmount.toFixed(2)}
                            </h2>

                        </div>

                    </div>


                    {/* Paid Bills */}

                    <div className="patient-stat-card">

                        <div className="patient-stat-icon">
                            ✓
                        </div>

                        <div>

                            <p>
                                Paid Bills
                            </p>

                            <h2>
                                {paidBills}
                            </h2>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div className="patient-error">
                        {error}
                    </div>

                )}


                {/* =================================================
                    HOSPITAL BILLS
                ================================================== */}

                <section className="patient-section">

                    <div className="patient-section-heading">

                        <div>

                            <h2>
                                Hospital Bills
                            </h2>

                            <p>
                                Complete details of your
                                hospital billing records.
                            </p>

                        </div>

                    </div>


                    {loading ? (

                        <div className="patient-empty">

                            Loading billing records...

                        </div>

                    ) : bills.length === 0 ? (

                        <div className="patient-empty">

                            <div className="patient-empty-icon">
                                💳
                            </div>

                            <h3>
                                No Hospital Bills Available
                            </h3>

                            <p>
                                Your hospital bills will
                                appear here after billing
                                is completed.
                            </p>

                        </div>

                    ) : (

                        <div className="patient-table-wrapper">

                            <table className="patient-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Bill ID
                                        </th>

                                        <th>
                                            Bill Number
                                        </th>

                                        <th>
                                            Visited Doctor
                                        </th>

                                        <th>
                                            Doctor ID
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Description
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Total Amount
                                        </th>

                                        <th>
                                            Payment
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {bills.map(
                                        (bill) => (

                                            <tr
                                                key={
                                                    `hospital-${bill.id}`
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        #{bill.id}
                                                    </strong>

                                                </td>


                                                <td>
                                                    {
                                                        bill.billNumber ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    <strong>

                                                        {
                                                            getDoctorName(
                                                                bill
                                                            )
                                                        }

                                                    </strong>

                                                </td>


                                                <td>

                                                    {
                                                        bill.doctor?.id ||
                                                        "-"
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        getBillType(
                                                            bill
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        bill.description ||
                                                        "-"
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        getBillDate(
                                                            bill
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    <strong>

                                                        ₹
                                                        {Number(
                                                            bill.totalAmount ||
                                                            0
                                                        ).toFixed(2)}

                                                    </strong>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            bill.paymentStatus ===
                                                            "PAID"
                                                                ? "patient-status paid"
                                                                : "patient-status pending"
                                                        }
                                                    >

                                                        {
                                                            bill.paymentStatus ||
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


                {/* =================================================
                    PHARMACY BILLS
                ================================================== */}

                <section className="patient-section">

                    <div className="patient-section-heading">

                        <div>

                            <h2>
                                Pharmacy Bills
                            </h2>

                            <p>
                                View your prescription
                                medicine billing and
                                dispensing details.
                            </p>

                        </div>

                    </div>


                    {loading ? (

                        <div className="patient-empty">

                            Loading pharmacy bills...

                        </div>

                    ) : pharmacyBills.length === 0 ? (

                        <div className="patient-empty">

                            <div className="patient-empty-icon">
                                💊
                            </div>

                            <h3>
                                No Pharmacy Bills Available
                            </h3>

                            <p>
                                Your pharmacy bills will
                                appear here after medicines
                                are billed.
                            </p>

                        </div>

                    ) : (

                        <div className="patient-table-wrapper">

                            <table className="patient-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Bill ID
                                        </th>

                                        <th>
                                            Bill Number
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
                                            Total Amount
                                        </th>

                                        <th>
                                            Payment
                                        </th>

                                        <th>
                                            Dispensing
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {pharmacyBills.map(
                                        (bill) => (

                                            <tr
                                                key={
                                                    `pharmacy-${bill.id}`
                                                }
                                            >

                                                {/* Bill ID */}

                                                <td>

                                                    <strong>
                                                        #{bill.id}
                                                    </strong>

                                                </td>


                                                {/* Bill Number */}

                                                <td>

                                                    {
                                                        bill.billNumber ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* Medicine */}

                                                <td>

                                                    <strong>

                                                        {
                                                            bill.medicineName ||
                                                            "-"
                                                        }

                                                    </strong>

                                                </td>


                                                {/* Quantity */}

                                                <td>

                                                    {
                                                        bill.quantity ||
                                                        0
                                                    }

                                                </td>


                                                {/* Price */}

                                                <td>

                                                    ₹
                                                    {Number(
                                                        bill.pricePerTablet ||
                                                        0
                                                    ).toFixed(2)}

                                                </td>


                                                {/* Total */}

                                                <td>

                                                    <strong>

                                                        ₹
                                                        {Number(
                                                            bill.totalAmount ||
                                                            0
                                                        ).toFixed(2)}

                                                    </strong>

                                                </td>


                                                {/* Payment */}

                                                <td>

                                                    <span
                                                        className={
                                                            bill.paymentStatus ===
                                                            "PAID"
                                                                ? "patient-status paid"
                                                                : "patient-status pending"
                                                        }
                                                    >

                                                        {
                                                            bill.paymentStatus ||
                                                            "PENDING"
                                                        }

                                                    </span>

                                                </td>


                                                {/* Dispensing */}

                                                <td>

                                                    <span
                                                        className={
                                                            bill.dispensingStatus ===
                                                            "DISPENSED"
                                                                ? "patient-status paid"
                                                                : "patient-status pending"
                                                        }
                                                    >

                                                        {
                                                            bill.dispensingStatus ||
                                                            "PENDING"
                                                        }

                                                    </span>

                                                </td>


                                                {/* Date */}

                                                <td>

                                                    {
                                                        getBillDate(
                                                            bill
                                                        )
                                                    }

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

export default Bills;