import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./bed.css";

const Admissions = () => {

    const navigate = useNavigate();

    const [admissions, setAdmissions] = useState([]);
    const [availableBeds, setAvailableBeds] = useState([]);

    const [loading, setLoading] = useState(true);
    const [selectedAdmission, setSelectedAdmission] = useState(null);
    const [selectedBed, setSelectedBed] = useState("");

    // ==============================
    // LOAD DATA
    // ==============================

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {

        try {

            setLoading(true);

            const [admissionResponse, bedResponse] =
                await Promise.all([
                    api.get("/bed/admissions"),
                    api.get("/bed/beds/available")
                ]);

            const allAdmissions =
                admissionResponse.data || [];

            const beds =
                bedResponse.data || [];

            // Show only active admissions
            const activeAdmissions =
                allAdmissions.filter(
                    admission =>
                        admission.status !== "DISCHARGED"
                );

            setAdmissions(activeAdmissions);
            setAvailableBeds(beds);

        } catch (error) {

            console.error(
                "Unable to load admission data",
                error
            );

            alert(
                error.response?.data ||
                "Unable to load admission data"
            );

        } finally {

            setLoading(false);

        }
    };

    // ==============================
    // SELECT ADMISSION
    // ==============================

    const selectAdmission = (admission) => {

        setSelectedAdmission(admission);
        setSelectedBed("");

    };

    // ==============================
    // ASSIGN BED
    // ==============================

    const assignBed = async () => {

        if (!selectedAdmission) {

            alert("Please select an admission");

            return;
        }

        if (!selectedBed) {

            alert("Please select a bed");

            return;
        }

        try {

            await api.put(
                `/bed/admission/${selectedAdmission.id}/assign/${selectedBed}`
            );

            alert(
                "Bed assigned successfully"
            );

            setSelectedAdmission(null);
            setSelectedBed("");

            loadData();

        } catch (error) {

            console.error(
                "Unable to assign bed",
                error
            );

            alert(
                error.response?.data ||
                "Unable to assign bed"
            );
        }
    };

    // ==============================
    // CLOSE ALLOCATION
    // ==============================

    const closeAllocation = () => {

        setSelectedAdmission(null);
        setSelectedBed("");

    };

    // ==============================
    // BED DISPLAY
    // ==============================

    const getBedName = (bed) => {

        return `${bed.wardName || "Ward"} - Room ${
            bed.roomNumber || "-"
        } - Bed ${
            bed.bedNumber || "-"
        }`;
    };

    // ==============================
    // LOADING
    // ==============================

    if (loading) {

        return (

            <div className="bed-page">

                <header className="bed-page-header">

                    <div>

                        <button
                            className="bed-back-button"
                            onClick={() =>
                                navigate("/bed")
                            }
                        >
                            ← Dashboard
                        </button>

                        <h1>
                            Bed Allocation
                        </h1>

                        <p>
                            Allocate beds for admitted patients
                        </p>

                    </div>

                </header>

                <div className="bed-loading">
                    Loading admissions...
                </div>

            </div>

        );
    }

    return (

        <div className="bed-page">

            {/* ==============================
                HEADER
            ============================== */}

            <header className="bed-page-header">

                <div>

                    <button
                        className="bed-back-button"
                        onClick={() =>
                            navigate("/bed")
                        }
                    >
                        ← Dashboard
                    </button>

                    <h1>
                        Bed Allocation
                    </h1>

                    <p>
                        Allocate beds for admitted patients
                    </p>

                </div>

                <button
                    className="bed-refresh-button"
                    onClick={loadData}
                >
                    ↻ Refresh
                </button>

            </header>


            {/* ==============================
                SUMMARY
            ============================== */}

            <div className="bed-stats-grid">

                <div className="bed-stat-card">

                    <div className="bed-stat-icon">
                        🏥
                    </div>

                    <div>

                        <span>
                            Active Admissions
                        </span>

                        <strong>
                            {admissions.length}
                        </strong>

                    </div>

                </div>


                <div className="bed-stat-card">

                    <div className="bed-stat-icon">
                        🛏️
                    </div>

                    <div>

                        <span>
                            Available Beds
                        </span>

                        <strong>
                            {availableBeds.length}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ==============================
                ALLOCATION PANEL
            ============================== */}

            {selectedAdmission && (

                <div className="bed-form-card">

                    <div className="bed-form-header">

                        <div>

                            <h2>
                                Allocate Bed
                            </h2>

                            <p>
                                Admission #{selectedAdmission.id}
                            </p>

                        </div>

                        <button
                            onClick={closeAllocation}
                        >
                            ✕
                        </button>

                    </div>


                    {/* PATIENT INFORMATION */}

                    <div className="bed-form-grid">

                        <div className="bed-form-group">

                            <label>
                                Patient
                            </label>

                            <input
                                type="text"
                                value={
                                    selectedAdmission.patient
                                        ?.fullName ||
                                    "-"
                                }
                                readOnly
                            />

                        </div>


                        <div className="bed-form-group">

                            <label>
                                Patient ID
                            </label>

                            <input
                                type="text"
                                value={
                                    selectedAdmission.patient
                                        ?.id ||
                                    "-"
                                }
                                readOnly
                            />

                        </div>


                        <div className="bed-form-group">

                            <label>
                                UHID
                            </label>

                            <input
                                type="text"
                                value={
                                    selectedAdmission.patient
                                        ?.uhid ||
                                    "-"
                                }
                                readOnly
                            />

                        </div>


                        <div className="bed-form-group">

                            <label>
                                Doctor
                            </label>

                            <input
                                type="text"
                                value={
                                    selectedAdmission.doctor
                                        ?.fullName ||
                                    "-"
                                }
                                readOnly
                            />

                        </div>

                    </div>


                    {/* BED SELECTION */}

                    <div className="bed-form-group">

                        <label>
                            Select Available Bed *
                        </label>

                        <select
                            value={selectedBed}
                            onChange={(e) =>
                                setSelectedBed(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                Select a bed
                            </option>

                            {availableBeds.map(
                                (bed) => (

                                    <option
                                        key={bed.id}
                                        value={bed.id}
                                    >
                                        {getBedName(bed)}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* ACTIONS */}

                    <div className="bed-form-actions">

                        <button
                            type="button"
                            className="bed-secondary-button"
                            onClick={closeAllocation}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="bed-submit-button"
                            onClick={assignBed}
                        >
                            Assign Bed
                        </button>

                    </div>

                </div>

            )}


            {/* ==============================
                ADMISSIONS
            ============================== */}

            <div className="bed-table-card">

                <div className="bed-table-header">

                    <div>

                        <h2>
                            Active Admissions
                        </h2>

                        <span>
                            {admissions.length} admission(s)
                        </span>

                    </div>

                </div>


                {admissions.length === 0 ? (

                    <div className="bed-empty">

                        <div>
                            🏥
                        </div>

                        <h3>
                            No Active Admissions
                        </h3>

                        <p>
                            There are currently no active
                            patient admissions.
                        </p>

                    </div>

                ) : (

                    <div className="bed-table-wrapper">

                        <table className="bed-table">

                            <thead>

                                <tr>

                                    <th>
                                        Admission ID
                                    </th>

                                    <th>
                                        Patient
                                    </th>

                                    <th>
                                        Patient ID
                                    </th>

                                    <th>
                                        UHID
                                    </th>

                                    <th>
                                        Doctor
                                    </th>

                                    <th>
                                        Admission Date
                                    </th>

                                    <th>
                                        Reason
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Bed
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {admissions.map(
                                    (admission) => {

                                        const hasBed =
                                            admission.bed &&
                                            admission.bed.id;

                                        return (

                                            <tr
                                                key={
                                                    admission.id
                                                }
                                            >

                                                {/* ADMISSION ID */}

                                                <td>

                                                    <strong>
                                                        #
                                                        {
                                                            admission.id
                                                        }
                                                    </strong>

                                                </td>


                                                {/* PATIENT */}

                                                <td>

                                                    {
                                                        admission
                                                            .patient
                                                            ?.fullName ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* PATIENT ID */}

                                                <td>

                                                    {
                                                        admission
                                                            .patient
                                                            ?.id ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* UHID */}

                                                <td>

                                                    {
                                                        admission
                                                            .patient
                                                            ?.uhid ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* DOCTOR */}

                                                <td>

                                                    {
                                                        admission
                                                            .doctor
                                                            ?.fullName ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* DATE */}

                                                <td>

                                                    {
                                                        admission
                                                            .admissionDate ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* REASON */}

                                                <td>

                                                    {
                                                        admission
                                                            .reason ||
                                                        "-"
                                                    }

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            admission.status ===
                                                            "ADMITTED"
                                                                ? "bed-status status-occupied"
                                                                : "bed-status"
                                                        }
                                                    >
                                                        {
                                                            admission.status ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>


                                                {/* BED */}

                                                <td>

                                                    {hasBed ? (

                                                        <span>
                                                            {
                                                                admission
                                                                    .bed
                                                                    ?.wardName
                                                            }
                                                            {" - "}
                                                            Room{" "}
                                                            {
                                                                admission
                                                                    .bed
                                                                    ?.roomNumber
                                                            }
                                                            {" - "}
                                                            {
                                                                admission
                                                                    .bed
                                                                    ?.bedNumber
                                                            }
                                                        </span>

                                                    ) : (

                                                        <span>
                                                            Not Assigned
                                                        </span>

                                                    )}

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    {!hasBed ? (

                                                        <button
                                                            className="bed-edit-button"
                                                            onClick={() =>
                                                                selectAdmission(
                                                                    admission
                                                                )
                                                            }
                                                        >
                                                            Allocate Bed
                                                        </button>

                                                    ) : (

                                                        <span>
                                                            ✓ Allocated
                                                        </span>

                                                    )}

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );
};

export default Admissions;