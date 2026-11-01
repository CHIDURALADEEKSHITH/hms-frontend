import { useState } from "react";
import FeatureLayout from "../shared/FeatureLayout";
import { Card, Empty, Notice } from "../shared/ui";
import { uid, useStore } from "../shared/storage";
import { HELPLINES } from "../../extras/menus";

const FAQ = [
    ["How do I cancel or reschedule an appointment?", "Open My Appointments, pick the appointment and choose cancel or reschedule. Do this before the appointment time."],
    ["Where can I see my lab reports?", "Lab Reports lists every test. A report can be opened once the laboratory has uploaded it."],
    ["How do I pay a bill?", "Open Bills, choose the pending bill and follow the payment steps. You can also pay at the billing counter."],
    ["I forgot my password.", "On the sign-in page choose “Forgot password” and follow the OTP steps sent to your registered contact."],
    ["How do I update my phone number or address?", "Open My Profile, edit the details and save."]
];

const FeedbackSupport = () => {
    const [list, setList] = useStore("feedback", []);
    const [rating, setRating] = useState(0);
    const [form, setForm] = useState({ category: "Doctor consultation", message: "" });
    const [sent, setSent] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        if (!rating) return;
        setList((l) => [{ id: uid(), rating, ...form, at: new Date().toISOString() }, ...l]);
        setRating(0); setForm({ ...form, message: "" }); setSent(true);
        setTimeout(() => setSent(false), 4000);
    };

    return (
        <FeatureLayout title="Feedback & Support" subtitle="Tell us how your visit went and find help quickly.">
            {sent && <Notice tone="good">Thank you — your feedback has been saved.</Notice>}
            <Notice>Feedback is kept on this device for now. For urgent problems please call the hospital desk below.</Notice>

            <div className="fx-grid2">
                <Card title="Rate your experience">
                    <form className="fx-form" onSubmit={submit}>
                        <div className="wide">
                            <div className="fx-stars" role="radiogroup" aria-label="Rating">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button key={n} type="button" className={n <= rating ? "on" : ""} aria-label={`${n} star`} onClick={() => setRating(n)}>★</button>
                                ))}
                            </div>
                        </div>
                        <label className="wide"><span>About</span>
                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                {["Doctor consultation", "Nursing care", "Reception & billing", "Pharmacy", "Laboratory", "Cleanliness", "Website / app", "Other"].map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </label>
                        <label className="wide"><span>Your comments</span>
                            <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="What went well? What can we improve?" />
                        </label>
                        <div className="fx-form-actions"><button className="fx-btn primary" disabled={!rating}>Submit feedback</button></div>
                    </form>
                </Card>

                <Card title="Contact & emergency">
                    {HELPLINES.map((h) => (
                        <div key={h.label} className="fx-notice-item" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <div><h4>{h.label}</h4><small>{h.note}</small></div>
                            <a className="fx-btn" href={`tel:${h.number.replace(/\s/g, "")}`}>{h.number}</a>
                        </div>
                    ))}
                </Card>

                <Card title="Frequently asked questions">
                    {FAQ.map(([q, a]) => (
                        <details key={q} className="fx-notice-item"><summary style={{ cursor: "pointer", fontWeight: 700 }}>{q}</summary><p style={{ marginTop: 8 }}>{a}</p></details>
                    ))}
                </Card>

                <Card title="My previous feedback">
                    {list.length === 0 ? <Empty>You have not sent any feedback yet.</Empty> : list.slice(0, 8).map((f) => (
                        <div key={f.id} className="fx-notice-item">
                            <h4>{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)} <small>{f.category}</small></h4>
                            {f.message && <p>{f.message}</p>}
                            <small>{new Date(f.at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</small>
                        </div>
                    ))}
                </Card>
            </div>
        </FeatureLayout>
    );
};

export default FeedbackSupport;
