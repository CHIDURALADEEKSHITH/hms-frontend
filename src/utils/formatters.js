export const formatDate = (date) => {

    if (!date) {
        return "-";
    }

    try {

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    } catch (error) {

        return date;
    }
};


export const formatDateTime = (date) => {

    if (!date) {
        return "-";
    }

    try {

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

    } catch (error) {

        return date;
    }
};


export const formatCurrency = (amount) => {

    if (
        amount === null ||
        amount === undefined ||
        amount === ""
    ) {
        return "₹0.00";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(Number(amount));
};


export const capitalize = (value) => {

    if (!value) {
        return "";
    }

    return value
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
};


export const formatRole = (role) => {

    if (!role) {
        return "";
    }

    const roles = {
        ADMIN: "Administrator",
        DOCTOR: "Doctor",
        NURSE: "Nurse",
        RECEPTIONIST: "Receptionist",
        PATIENT: "Patient",
        PHARMACIST: "Pharmacist",
        LAB_INCHARGE: "Lab In-Charge",
        BED_INCHARGE: "Bed In-Charge"
    };

    return roles[role] || role;
};


export const formatStatus = (status) => {

    if (!status) {
        return "-";
    }

    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
};