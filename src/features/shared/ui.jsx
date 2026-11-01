/* Small presentational pieces shared by every feature page. */

export const Stat = ({ label, value, tone = "", hint }) => (
    <div className={`fx-stat ${tone}`}>
        <span>{label}</span>
        <strong>{value}</strong>
        {hint && <small>{hint}</small>}
    </div>
);

export const StatStrip = ({ items }) => (
    <div className="fx-stats">
        {items.map((s) => <Stat key={s.label} {...s} />)}
    </div>
);

export const Card = ({ title, action, children, className = "" }) => (
    <section className={`fx-card ${className}`}>
        {(title || action) && (
            <header className="fx-card-head">
                {title && <h3>{title}</h3>}
                {action}
            </header>
        )}
        {children}
    </section>
);

export const Empty = ({ children = "Nothing here yet." }) => <div className="fx-empty">{children}</div>;

export const Notice = ({ tone = "info", children }) => <div className={`fx-notice ${tone}`}>{children}</div>;

export const Badge = ({ tone = "muted", children }) => <span className={`fx-badge ${tone}`}>{children}</span>;

/* horizontal bar list: items = [{ label, value, tone? }] */
export const Bars = ({ items, format = (v) => v }) => {
    const max = Math.max(1, ...items.map((i) => i.value));
    if (!items.length) return <Empty>No data to chart.</Empty>;
    return (
        <ul className="fx-bars">
            {items.map((i) => (
                <li key={i.label}>
                    <span className="fx-bar-label">{i.label}</span>
                    <span className="fx-bar-track"><i className={i.tone || ""} style={{ width: `${(i.value / max) * 100}%` }} /></span>
                    <span className="fx-bar-value">{format(i.value)}</span>
                </li>
            ))}
        </ul>
    );
};

/* vertical columns: items = [{ label, value }] */
export const Columns = ({ items, format = (v) => v }) => {
    const max = Math.max(1, ...items.map((i) => i.value));
    if (!items.length) return <Empty>No data to chart.</Empty>;
    return (
        <div className="fx-cols">
            {items.map((i) => (
                <div key={i.label} className="fx-col">
                    <em>{format(i.value)}</em>
                    <span className="fx-col-bar"><i style={{ height: `${Math.max(2, (i.value / max) * 100)}%` }} /></span>
                    <small>{i.label}</small>
                </div>
            ))}
        </div>
    );
};

const PALETTE = ["var(--t-maroon)", "var(--t-gold)", "#2f7d6d", "#3d6fb6", "#8a5ba8", "#c9622f", "#6b7280"];

/* donut using conic-gradient: items = [{ label, value }] */
export const Donut = ({ items, centre }) => {
    const total = items.reduce((s, i) => s + i.value, 0);
    if (!total) return <Empty>No data to chart.</Empty>;
    let acc = 0;
    const stops = items.map((i, idx) => {
        const from = (acc / total) * 100;
        acc += i.value;
        return `${PALETTE[idx % PALETTE.length]} ${from}% ${(acc / total) * 100}%`;
    });
    return (
        <div className="fx-donut-wrap">
            <div className="fx-donut" style={{ background: `conic-gradient(${stops.join(",")})` }}>
                <div><strong>{centre ?? total}</strong><small>total</small></div>
            </div>
            <ul className="fx-legend">
                {items.map((i, idx) => (
                    <li key={i.label}><i style={{ background: PALETTE[idx % PALETTE.length] }} />{i.label}<b>{i.value}</b></li>
                ))}
            </ul>
        </div>
    );
};

/* simple SVG line chart: points = [{ label, value }] */
export const LineChart = ({ points, unit = "", height = 160 }) => {
    if (points.length < 2) return <Empty>Add at least two readings to see a trend.</Empty>;
    const w = 520, h = height, pad = 24;
    const vals = points.map((p) => p.value);
    const min = Math.min(...vals), max = Math.max(...vals);
    const span = max - min || 1;
    const x = (i) => pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = (v) => h - pad - ((v - min) / span) * (h - pad * 2);
    const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
    return (
        <svg className="fx-line" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Trend chart">
            <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} />
            <path d={path} />
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={x(i)} cy={y(p.value)} r="3.5" />
                    <title>{`${p.label}: ${p.value}${unit}`}</title>
                </g>
            ))}
            <text x={pad} y={14}>{max}{unit}</text>
            <text x={pad} y={h - 6}>{min}{unit}</text>
        </svg>
    );
};
