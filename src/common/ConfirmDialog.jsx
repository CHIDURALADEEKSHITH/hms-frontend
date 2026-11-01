import "./common.css";

const ConfirmDialog = ({
    isOpen,
    title = "Confirm Action",
    message = "Are you sure you want to continue?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel
}) => {

    if (!isOpen) {
        return null;
    }

    return (
        <div className="dialog-overlay">

            <div className="confirm-dialog">

                <div className="dialog-icon">
                    ⚠️
                </div>

                <h2>{title}</h2>

                <p>{message}</p>

                <div className="dialog-actions">

                    <button
                        className="dialog-cancel"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>

                    <button
                        className="dialog-confirm"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>

                </div>

            </div>

        </div>
    );
};

export default ConfirmDialog;