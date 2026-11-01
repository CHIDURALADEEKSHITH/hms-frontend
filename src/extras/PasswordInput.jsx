import { useState } from "react";

/* Password box with show/hide button and optional strength meter.
   Accepts every normal <input> prop, so it is a drop-in replacement. */

const scorePassword = (value = "") => {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return score; // 0-4
};

const LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];

const PasswordInput = ({ strength = false, ...inputProps }) => {

    const [visible, setVisible] = useState(false);
    const score = scorePassword(inputProps.value);

    return (
        <div className="pw-field">
            <div className="pw-box">
                <input
                    {...inputProps}
                    type={visible ? "text" : "password"}
                />
                <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? "Hide" : "Show"}
                </button>
            </div>

            {strength && inputProps.value && (
                <div className="pw-meter" data-score={score}>
                    <div className="pw-bars">
                        {[1, 2, 3, 4].map((n) => (
                            <span key={n} className={score >= n ? "on" : ""} />
                        ))}
                    </div>
                    <small>{LABELS[score]}</small>
                </div>
            )}
        </div>
    );
};

export default PasswordInput;
