import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./bed.css";

const Transfers = () => {

    const navigate = useNavigate();

    const [admissions, setAdmissions] = useState([]);
    const [availableBeds, setAvailableBeds] = useState([]);

    const [selectedAdmission, setSelectedAdmission] = useState(null);
    const [selectedBed, setSelectedBed] = useState("");

    const [loading, setLoading] = useState(true);

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

            // Only patients who are admitted
            // AND already have a bed
            const activeAdmissions =
                allAdmissions.filter(
                    admission =>
                        admission.status === "ADMITTED" &&
                        admission.bed &&
                        admission.bed.id
                );

            setAdmissions(activeAdmissions);
            setAvailableBeds(beds);

        } catch (error) {

            console.error(
                "Unable to load transfer data",
                error
            );

            alert(
                error.response?.data ||
                "Unable to load transfer data"
            );

        } finally {

            setLoading(false);

        }
    };

    // ==============================
    // SELECT PATIENT
    // ==============================

    const selectAdmission = (admission) => {

        setSelectedAdmission(admission);
        setSelectedBed("");

    };

    // ==============================
    // TRANSFER BED
    // ==============================

    const transferPatient = async () => {

        if (!selectedAdmission) {

            alert("Please select a patient");

            return;
        }

        if (!selectedBed) {

            alert("Please select the new bed");

            return;
        }

        try {

            await api.put(
                `/bed/admission/${selectedAdmission.id}/transfer/${selectedBed}`
            );

            alert(
                "Patient transferred successfully"
            );

            setSelectedAdmission(null);
            setSelectedBed("");

            loadData();

        } catch (error) {

            console.error(
                "Unable to transfer patient",
                error
            );

            alert(
                error.response?.data ||
                "Unable to transfer patient"
            );
        }
    };

    // ==============================
    // CLOSE
    // ==============================

    const closeTransfer = () => {

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
                            onClick={() => navigate("/bed")}
                        >
                            ← Dashboard
                        </button>

                        <h1>
                            Patient Transfers
                        </h1>

                        <p>
                            Transfer admitted patients between
                            hospital beds
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
                        onClick={() => navigate("/bed")}
                    >
                        ← Dashboard
                    </button>

                    <h1>
                        Patient Transfers
                    </h1>

                    <p>
                        Transfer admitted patients between
                        hospital beds
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
                            Currently Admitted
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
                TRANSFER FORM
            ============================== */}

            {selectedAdmission && (

                <div className="bed-form-card">

                    <div className="bed-form-header">

                        <div>

                            <h2>
                                Transfer Patient
                            </h2>

                            <p>
                                Admission #
                                {selectedAdmission.id}
                            </p>

                        </div>

                        <button
                            onClick={closeTransfer}
                        >
                            ✕
                        </button>

                    </div>


                    <div className="bed-form-grid">

                        {/* PATIENT */}

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


                        {/* PATIENT ID */}

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


                        {/* UHID */}

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


                        {/* DOCTOR */}

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


                    {/* CURRENT BED */}

                    <div className="bed-form-group">

                        <label>
                            Current Bed
                        </label>

                        <input
                            type="text"
                            value={getBedName(
                                selectedAdmission.bed
                            )}
                            readOnly
                        />

                    </div>


                    {/* NEW BED */}

                    <div className="bed-form-group">

                        <label>
                            Select New Bed *
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
                                Select new bed
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
                            onClick={closeTransfer}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="bed-submit-button"
                            onClick={transferPatient}
                        >
                            Transfer Patient
                        </button>

                    </div>

                </div>

            )}


            {/* ==============================
                CURRENTLY ADMITTED
            ============================== */}

            <div className="bed-table-card">

                <div className="bed-table-header">

                    <div>

                        <h2>
                            Currently Admitted Patients
                        </h2>

                        <span>
                            {admissions.length} patient(s)
                        </span>

                    </div>

                </div>


                {admissions.length === 0 ? (

                    <div className="bed-empty">

                        <div>
                            🔄
                        </div>

                        <h3>
                            No Active Admissions
                        </h3>

                        <p>
                            No admission records are currently
                            available for transfer.
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
                                        Current Bed
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

                                {admissions.map(
                                    (admission) => (

                                        <tr
                                            key={admission.id}
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


                                            {/* CURRENT BED */}

                                            <td>

                                                {
                                                    getBedName(
                                                        admission.bed
                                                    )
                                                }

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span className="bed-status status-occupied">
                                                    {
                                                        admission.status
                                                    }
                                                </span>

                                            </td>


                                            {/* ACTION */}

                                            <td>

                                                <button
                                                    className="bed-edit-button"
                                                    onClick={() =>
                                                        selectAdmission(
                                                            admission
                                                        )
                                                    }
                                                >
                                                    Transfer
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

export default Transfers;