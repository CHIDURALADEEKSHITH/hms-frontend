import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FeatureLayout from "./shared/FeatureLayout";
import { Card, Empty } from "./shared/ui";
import { useStore } from "./shared/storage";
import { roleFeatures } from "./registry";

/* "All tools" page for the logged-in role + notices posted by the admin. */
const FeatureHub = () => {
    const { user } = useAuth();
    const items = roleFeatures(user?.role);
    const [notices] = useStore("announcements", [], true);
    const today = new Date().toISOString().slice(0, 10);

    const visible = notices
        .filter((n) => n.status !== "ARCHIVED")
        .filter((n) => !n.expires || n.expires >= today)
        .filter((n) => n.audience === "ALL" || n.audience === user?.role)
        .sort((a, b) => (b.priority === "HIGH") - (a.priority === "HIGH") || b.createdAt.localeCompare(a.createdAt));

    return (
        <FeatureLayout title="Tools & Notices" subtitle="Extra tools for your role, plus the latest notices from hospital administration.">
            <div className="fx-hub">
                {items.map((f) => (
                    <Link key={f.key} to={f.path} className="fx-tile">
                        <span>{f.icon}</span>
                        <h3>{f.label}</h3>
                        <p>{f.desc}</p>
                        <em>Open →</em>
                    </Link>
                ))}
            </div>

            <Card title="Notices">
                {visible.length === 0 ? (
                    <Empty>No notices right now.</Empty>
                ) : visible.map((n) => (
                    <div key={n.id} className="fx-notice-item">
                        <h4>{n.priority === "HIGH" && "❗ "}{n.title}</h4>
                        <p>{n.message}</p>
                        <small>
                            {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                            {n.expires && ` · until ${n.expires}`}
                            {n.audience !== "ALL" && ` · for ${n.audience.replace("_", " ").toLowerCase()}`}
                        </small>
                    </div>
                ))}
            </Card>
        </FeatureLayout>
    );
};

export default FeatureHub;
