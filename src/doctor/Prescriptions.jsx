import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./doctor.css";

const Prescriptions = () => {

    const navigate = useNavigate();

    // Patient ID + Appointment DB ID
    const { patientId, appointmentId } = useParams();

    const { user } = useAuth();

    const [prescriptions, setPrescriptions] = useState([]);
    const [appointments, setAppointments] = useState([]);

    const [appointmentsLoading, setAppointmentsLoading] = useState(
        Boolean(patientId)
    );

    const [appointmentsError, setAppointmentsError] = useState("");

    const [formData, setFormData] = useState({
        medicine: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: ""
    });

    const [medicineList, setMedicineList] = useState([]);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    // =====================================================
    // LOAD APPOINTMENTS + PRESCRIPTIONS
    // =====================================================

    useEffect(() => {

        if (user?.userId) {
            loadAppointments();
        }

        if (patientId && appointmentId) {
            loadPrescriptions();
        }

    }, [patientId, appointmentId, user?.userId]);


    // =====================================================
    // LOAD DOCTOR APPOINTMENTS
    // =====================================================

    const loadAppointments = async () => {

        try {

            setAppointmentsLoading(true);
            setAppointmentsError("");

            const response = await api.get(
                `/doctor/${user.userId}/appointments`
            );

            setAppointments(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Patient list loading error:",
                err
            );

            setAppointmentsError(
                err.response?.data ||
                "Unable to load patients."
            );

        } finally {

            setAppointmentsLoading(false);

        }
    };


    // =====================================================
    // LOAD PRESCRIPTIONS FOR THIS APPOINTMENT ONLY
    // =====================================================

    const loadPrescriptions = async () => {

        try {

            if (!appointmentId) {
                setPrescriptions([]);
                return;
            }

            const response = await api.get(
                `/doctor/appointment/${appointmentId}/prescriptions`
            );

            setPrescriptions(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {

            console.error(
                "Prescription loading error:",
                err
            );

            setPrescriptions([]);

        }
    };


    // =====================================================
    // CREATE UNIQUE PATIENT LIST
    // =====================================================

    const patients = appointments.reduce(
        (results, appointment) => {

            const id =
                appointment?.patient?.id ??
                appointment?.patientId ??
                appointment?.patient?.userId;

            if (
                id === null ||
                id === undefined ||
                results.some(
                    (patient) =>
                        String(patient.id) === String(id)
                )
            ) {
                return results;
            }

            results.push({
                id,
                name:
                    appointment?.patient?.fullName ||
                    appointment?.patientName ||
                    `Patient ${id}`
            });

            return results;
        },
        []
    );


    // =====================================================
    // APPOINTMENTS FOR CURRENT PATIENT
    // =====================================================

    const patientAppointments = appointments.filter(
        (appointment) => {

            const appointmentPatientId =
                appointment?.patient?.id ??
                appointment?.patientId ??
                appointment?.patient?.userId;

            return (
                String(appointmentPatientId) ===
                String(patientId)
            );
        }
    );


    // =====================================================
    // CURRENT APPOINTMENT
    // =====================================================

    const currentAppointment = patientAppointments.find(
        (appointment) => {

            const dbAppointmentId =
                appointment?.id;

            return (
                String(dbAppointmentId) ===
                String(appointmentId)
            );
        }
    );


    // =====================================================
    // CHECK WHETHER CURRENT APPOINTMENT IS VERIFIED
    // =====================================================

    const appointmentVerified = Boolean(
        currentAppointment?.verified ??
        currentAppointment?.isVerified
    );


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // =====================================================
    // ADD MEDICINE TO TEMPORARY LIST
    // =====================================================

    const addMedicine = (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if (
            appointmentsLoading ||
            appointmentsError ||
            !currentAppointment
        ) {

            setError(
                "Unable to confirm this appointment."
            );

            return;
        }

        if (appointmentVerified) {

            setError(
                "This appointment is verified. No more medicines can be added."
            );

            return;
        }


        if (!formData.medicine.trim()) {

            setError(
                "Please enter medicine name."
            );

            return;
        }


        if (!formData.dosage.trim()) {

            setError(
                "Please enter dosage."
            );

            return;
        }


        if (!formData.frequency.trim()) {

            setError(
                "Please select frequency."
            );

            return;
        }


        if (!formData.duration.trim()) {

            setError(
                "Please enter duration."
            );

            return;
        }


        setMedicineList((previous) => [

            ...previous,

            {
                id: Date.now(),

                medicine:
                    formData.medicine.trim(),

                dosage:
                    formData.dosage.trim(),

                frequency:
                    formData.frequency.trim(),

                duration:
                    formData.duration.trim(),

                instructions:
                    formData.instructions.trim()
            }

        ]);


        setFormData({
            medicine: "",
            dosage: "",
            frequency: "",
            duration: "",
            instructions: ""
        });

    };


    // =====================================================
    // REMOVE MEDICINE
    // =====================================================

    const removeMedicine = (medicineId) => {

        setMedicineList((previous) =>
            previous.filter(
                (medicine) =>
                    medicine.id !== medicineId
            )
        );

    };


    // =====================================================
    // SAVE ALL MEDICINES
    // =====================================================

    const savePrescription = async () => {

        setMessage("");
        setError("");


        if (!patientId) {

            setError(
                "Patient ID is missing."
            );

            return;
        }


        if (!appointmentId) {

            setError(
                "Appointment ID is missing."
            );

            return;
        }


        if (
            appointmentsLoading ||
            appointmentsError ||
            !currentAppointment
        ) {

            setError(
                "Unable to confirm this appointment."
            );

            return;
        }


        if (appointmentVerified) {

            setError(
                "This appointment is verified. No more medicines can be added."
            );

            return;
        }


        if (!user?.userId) {

            setError(
                "Doctor information is missing."
            );

            return;
        }


        if (medicineList.length === 0) {

            setError(
                "Please add at least one medicine."
            );

            return;
        }


        try {

            setLoading(true);


            // =====================================================
            // FIRST GET CONSULTATION FOR THIS APPOINTMENT
            // =====================================================

            const consultationResponse =
                await api.get(
                    `/doctor/consultation/appointment/${appointmentId}`
                );


            const consultation =
                consultationResponse.data;


            if (!consultation?.id) {

                throw new Error(
                    "Consultation not found for this appointment."
                );
            }


            // =====================================================
            // SAVE EACH MEDICINE
            // =====================================================

            for (const medicine of medicineList) {

                const data = {

                    doctor: {
                        id: Number(user.userId)
                    },

                    patient: {
                        id: Number(patientId)
                    },

                    consultation: {
                        id: Number(consultation.id)
                    },

                    medicine:
                        medicine.medicine,

                    dosage:
                        medicine.dosage,

                    frequency:
                        medicine.frequency,

                    duration:
                        medicine.duration,

                    instructions:
                        medicine.instructions
                };


                await api.post(
                    "/doctor/prescription",
                    data
                );

            }


            setMedicineList([]);


            setMessage(
                `${medicineList.length} medicine${
                    medicineList.length > 1
                        ? "s"
                        : ""
                } prescribed successfully.`
            );


            // Reload only prescriptions
            // belonging to this appointment
            await loadPrescriptions();


        } catch (err) {

            console.error(
                "Prescription save error:",
                err
            );

            setError(
                err.response?.data ||
                err.message ||
                "Unable to save prescription."
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="doctor-page">


            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="doctor-page-header">

                <div>

                    <h1>
                        Prescriptions
                    </h1>

                    <p>
                        Prescribe medicines for the patient
                    </p>

                </div>


                <button
                    className="doctor-back-button"
                    onClick={() =>
                        navigate(
                            patientId
                                ? `/doctor/patient/${patientId}`
                                : "/doctor"
                        )
                    }
                >
                    {patientId
                        ? "← Patient Details"
                        : "← Dashboard"}
                </button>

            </div>


            {/* =====================================================
                MAIN CARD
            ===================================================== */}

            <div className="doctor-form-card">


                {/* =====================================================
                    PATIENT BANNER
                ===================================================== */}

                <div className="consultation-patient-banner">

                    <div className="consultation-patient-icon">
                        💊
                    </div>

                    <div>

                        <span>
                            Prescribing For
                        </span>

                        <strong>
                            Patient ID: {patientId || "-"}
                        </strong>

                        {appointmentId && (
                            <small
                                style={{
                                    display: "block",
                                    marginTop: "5px"
                                }}
                            >
                                Appointment ID: {appointmentId}
                            </small>
                        )}

                    </div>

                </div>


                {/* =====================================================
                    SUCCESS MESSAGE
                ===================================================== */}

                {message && (

                    <div className="doctor-success">

                        {message}

                    </div>

                )}


                {/* =====================================================
                    ERROR MESSAGE
                ===================================================== */}

                {error && (

                    <div className="doctor-error">

                        {error}

                    </div>

                )}


                {/* =====================================================
                    NO PATIENT SELECTED
                ===================================================== */}

                {!patientId ? (

                    <div>

                        <h2>
                            Select a patient
                        </h2>

                        <p>
                            Choose a patient to view their
                            previous prescriptions or write
                            a new one.
                        </p>


                        {appointmentsLoading ? (

                            <div className="doctor-loading">
                                Loading patients...
                            </div>

                        ) : appointmentsError ? (

                            <div className="doctor-error">
                                {appointmentsError}
                            </div>

                        ) : patients.length > 0 ? (

                            <div className="doctor-form-group">

                                <label htmlFor="prescription-patient">
                                    Patient
                                </label>

                                <select
                                    id="prescription-patient"
                                    value=""
                                    onChange={(event) => {

                                        if (
                                            event.target.value
                                        ) {

                                            const selectedPatient =
                                                event.target.value;

                                            const selectedAppointment =
                                                appointments.find(
                                                    (appointment) => {

                                                        const id =
                                                            appointment?.patient?.id ??
                                                            appointment?.patientId ??
                                                            appointment?.patient?.userId;

                                                        return (
                                                            String(id) ===
                                                            String(
                                                                selectedPatient
                                                            )
                                                        );
                                                    }
                                                );

                                            if (
                                                selectedAppointment?.id
                                            ) {

                                                navigate(
                                                    `/doctor/prescriptions/${selectedPatient}/${selectedAppointment.id}`
                                                );

                                            }

                                        }

                                    }}
                                >

                                    <option value="">
                                        Select a patient
                                    </option>

                                    {patients.map(
                                        (patient) => (

                                            <option
                                                key={
                                                    patient.id
                                                }
                                                value={
                                                    patient.id
                                                }
                                            >

                                                {patient.name}
                                                {" "}
                                                (ID:{" "}
                                                {patient.id}
                                                )

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        ) : (

                            <div className="doctor-empty">

                                <h3>
                                    No patients found
                                </h3>

                                <p>
                                    Patients with appointments
                                    will appear here.
                                </p>

                            </div>

                        )}

                    </div>


                ) : appointmentsLoading ? (

                    <div className="doctor-loading">

                        Checking appointment...

                    </div>


                ) : appointmentsError ? (

                    <div className="doctor-error">

                        {appointmentsError}

                    </div>


                ) : !appointmentId ? (

                    <div className="doctor-error">

                        Appointment ID is missing.

                    </div>


                ) : !currentAppointment ? (

                    <div className="doctor-error">

                        This appointment was not found
                        in your schedule.

                    </div>


                ) : appointmentVerified ? (

                    <div className="doctor-empty">

                        <h3>
                            Appointment verified
                        </h3>

                        <p>
                            No further medicines can be
                            added. Existing prescriptions
                            for this appointment remain
                            available below.
                        </p>

                    </div>


                ) : (

                    <>


                        {/* =====================================================
                            ADD MEDICINE
                        ===================================================== */}

                        <div
                            style={{
                                marginTop: "25px"
                            }}
                        >

                            <h2>
                                Add Medicine
                            </h2>

                            <p>
                                Enter the medicine prescribed
                                for this patient.
                            </p>


                            <form
                                onSubmit={addMedicine}
                            >

                                <div className="doctor-form-grid">


                                    {/* MEDICINE */}

                                    <div className="doctor-form-group">

                                        <label>
                                            Medicine Name
                                        </label>

                                        <input
                                            type="text"
                                            name="medicine"
                                            value={
                                                formData.medicine
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: Paracetamol"
                                            required
                                        />

                                    </div>


                                    {/* DOSAGE */}

                                    <div className="doctor-form-group">

                                        <label>
                                            Dosage
                                        </label>

                                        <input
                                            type="text"
                                            name="dosage"
                                            value={
                                                formData.dosage
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: 500 mg"
                                            required
                                        />

                                    </div>


                                    {/* FREQUENCY */}

                                    <div className="doctor-form-group">

                                        <label>
                                            Frequency
                                        </label>

                                        <select
                                            name="frequency"
                                            value={
                                                formData.frequency
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select frequency
                                            </option>

                                            <option value="Once daily">
                                                Once daily
                                            </option>

                                            <option value="Twice daily">
                                                Twice daily
                                            </option>

                                            <option value="Three times daily">
                                                Three times daily
                                            </option>

                                            <option value="Four times daily">
                                                Four times daily
                                            </option>

                                            <option value="As needed">
                                                As needed
                                            </option>

                                        </select>

                                    </div>


                                    {/* DURATION */}

                                    <div className="doctor-form-group">

                                        <label>
                                            Duration
                                        </label>

                                        <input
                                            type="text"
                                            name="duration"
                                            value={
                                                formData.duration
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: 5 days"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* INSTRUCTIONS */}

                                <div className="doctor-form-group">

                                    <label>
                                        Instructions
                                    </label>

                                    <textarea
                                        name="instructions"
                                        value={
                                            formData.instructions
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Example: Take after food"
                                        rows="3"
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="doctor-primary-button"
                                >
                                    + Add Medicine
                                </button>

                            </form>

                        </div>


                        {/* =====================================================
                            MEDICINE LIST
                        ===================================================== */}

                        {medicineList.length > 0 && (

                            <div
                                style={{
                                    marginTop: "35px"
                                }}
                            >

                                <h2>
                                    Prescription Medicines
                                </h2>

                                <p>
                                    Review before saving.
                                </p>


                                <div className="doctor-table-wrapper">

                                    <table className="doctor-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    #
                                                </th>

                                                <th>
                                                    Medicine
                                                </th>

                                                <th>
                                                    Dosage
                                                </th>

                                                <th>
                                                    Frequency
                                                </th>

                                                <th>
                                                    Duration
                                                </th>

                                                <th>
                                                    Instructions
                                                </th>

                                                <th>
                                                    Action
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {medicineList.map(
                                                (
                                                    medicine,
                                                    index
                                                ) => (

                                                    <tr
                                                        key={
                                                            medicine.id
                                                        }
                                                    >

                                                        <td>
                                                            {index + 1}
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    medicine.medicine
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {
                                                                medicine.dosage
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                medicine.frequency
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                medicine.duration
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                medicine.instructions ||
                                                                "-"
                                                            }
                                                        </td>

                                                        <td>

                                                            <button
                                                                type="button"
                                                                className="doctor-small-danger-button"
                                                                onClick={() =>
                                                                    removeMedicine(
                                                                        medicine.id
                                                                    )
                                                                }
                                                            >
                                                                Remove
                                                            </button>

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>


                                {/* SAVE BUTTON */}

                                <div
                                    style={{
                                        marginTop: "20px",
                                        textAlign: "right"
                                    }}
                                >

                                    <button
                                        type="button"
                                        className="doctor-primary-button"
                                        onClick={
                                            savePrescription
                                        }
                                        disabled={
                                            loading
                                        }
                                    >

                                        {loading
                                            ? "Saving..."
                                            : `Save Prescription (${medicineList.length})`
                                        }

                                    </button>

                                </div>

                            </div>

                        )}

                    </>

                )}

            </div>


            {/* =====================================================
                PREVIOUS PRESCRIPTIONS
            ===================================================== */}

            {patientId && appointmentId && (

                <div className="doctor-table-card">

                    <div className="doctor-table-title">

                        <h2>
                            Previous Prescriptions
                        </h2>

                    </div>


                    {prescriptions.length === 0 ? (

                        <div className="doctor-empty">

                            <div>
                                💊
                            </div>

                            <h3>
                                No Previous Prescriptions
                            </h3>

                            <p>
                                No medicines prescribed for
                                this appointment yet.
                            </p>

                        </div>

                    ) : (

                        <div className="doctor-table-wrapper">

                            <table className="doctor-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Medicine
                                        </th>

                                        <th>
                                            Dosage
                                        </th>

                                        <th>
                                            Frequency
                                        </th>

                                        <th>
                                            Duration
                                        </th>

                                        <th>
                                            Instructions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {prescriptions.map(
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
                                                    <strong>
                                                        {
                                                            item.medicine ||
                                                            "-"
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        item.dosage ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.frequency ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.duration ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.instructions ||
                                                        "-"
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            )}

        </div>

    );
};

export default Prescriptions;