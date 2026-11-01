import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_PAGES, HELPLINES, PALETTES } from "./menus";
import { applyPalette, getPalette } from "./theme";
import { roleFeatures, hubPath } from "../features/registry";
import "./extras.css";

/* Floating tools shown on every page:
   clock · quick search (Ctrl+K) · colour theme · emergency numbers · print · back to top */

const Extras = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [now, setNow] = useState(new Date());
    const [panel, setPanel] = useState(null);           // "theme" | "tools" | null
    const [searchOpen, setSearchOpen] = useState(false);
    const [emergencyOpen, setEmergencyOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const [palette, setPalette] = useState(getPalette());
    const [showTop, setShowTop] = useState(false);
    const inputRef = useRef(null);

    /* clock */
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(t);
    }, []);

    /* back-to-top visibility */
    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 400);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* close things on navigation */
    useEffect(() => {
        setPanel(null);
        setSearchOpen(false);
        setEmergencyOpen(false);
    }, [location.pathname]);

    /* Ctrl+K / Esc */
    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && user) {
                e.preventDefault();
                setSearchOpen((o) => !o);
                setQuery("");
                setActive(0);
            }
            if (e.key === "Escape") {
                setSearchOpen(false);
                setEmergencyOpen(false);
                setPanel(null);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [user]);

    useEffect(() => {
        if (searchOpen) setTimeout(() => inputRef.current?.focus(), 30);
    }, [searchOpen]);

    const pages = useMemo(() => {
        const list = ROLE_PAGES[user?.role] || [];
        const q = query.trim().toLowerCase();
        return q ? list.filter(([label]) => label.toLowerCase().includes(q)) : list;
    }, [user, query]);

    const go = (path) => {
        setSearchOpen(false);
        navigate(path);
    };

    const onSearchKey = (e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, pages.length - 1)); }
        if (e.key === "ArrowUp")   { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
        if (e.key === "Enter" && pages[active]) go(pages[active][1]);
    };

    const choosePalette = (id) => {
        setPalette(id);
        applyPalette(id);
    };

    const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const date = now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

    return (
        <>
            {/* ---------- dock ---------- */}
            <div className="xdock" role="toolbar" aria-label="Quick tools">

                <div className="xdock-clock" title="Local time">
                    <b>{time}</b>
                    <span>{date}</span>
                </div>

                {user && (
                    <button className="xdock-btn" onClick={() => { setSearchOpen(true); setQuery(""); setActive(0); }} title="Quick search (Ctrl+K)">
                        <span className="xi">⌕</span>
                        <em>Search</em>
                        <kbd>Ctrl K</kbd>
                    </button>
                )}

                {user && roleFeatures(user.role).length > 0 && (
                    <div className="xdock-wrap">
                        <button className="xdock-btn" onClick={() => setPanel(panel === "tools" ? null : "tools")} title="More tools for your role">
                            <span className="xi">✦</span>
                            <em>Tools</em>
                        </button>

                        {panel === "tools" && (
                            <div className="xpop xpop-tools">
                                <h4>Your tools</h4>
                                {roleFeatures(user.role).map((f) => (
                                    <button key={f.path} className="xpal" onClick={() => { setPanel(null); navigate(f.path); }}>
                                        <span className="xi">{f.icon}</span>
                                        {f.label}
                                    </button>
                                ))}
                                <button className="xpal" onClick={() => { setPanel(null); navigate(hubPath(user.role)); }}>
                                    <span className="xi">▦</span>
                                    All tools &amp; notices
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="xdock-wrap">
                    <button className="xdock-btn" onClick={() => setPanel(panel === "theme" ? null : "theme")} title="Change colour theme">
                        <span className="xi">◐</span>
                        <em>Theme</em>
                    </button>

                    {panel === "theme" && (
                        <div className="xpop">
                            <h4>Colour theme</h4>
                            {PALETTES.map((p) => (
                                <button
                                    key={p.id}
                                    className={`xpal ${palette === p.id ? "on" : ""}`}
                                    onClick={() => choosePalette(p.id)}
                                >
                                    <span className="xsw" style={{ background: `linear-gradient(135deg, ${p.swatch[0]} 50%, ${p.swatch[1]} 50%)` }} />
                                    {p.name}
                                    {palette === p.id && <i>✓</i>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button className="xdock-btn" onClick={() => window.print()} title="Print this page">
                    <span className="xi">⎙</span>
                    <em>Print</em>
                </button>

                <button className="xdock-btn xdock-sos" onClick={() => setEmergencyOpen(true)} title="Emergency numbers">
                    <span className="xi">✚</span>
                    <em>Emergency</em>
                </button>

                {showTop && (
                    <button className="xdock-btn xdock-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Back to top">
                        <span className="xi">↑</span>
                    </button>
                )}
            </div>

            {/* ---------- quick search ---------- */}
            {searchOpen && (
                <div className="xmodal-bg" onMouseDown={() => setSearchOpen(false)}>
                    <div className="xcmd" onMouseDown={(e) => e.stopPropagation()}>
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                            onKeyDown={onSearchKey}
                            placeholder={`Jump to a page…  (${user?.role?.replace("_", " ").toLowerCase()})`}
                        />
                        <ul>
                            {pages.length === 0 && <li className="xempty">No matching page</li>}
                            {pages.map(([label, path], i) => (
                                <li
                                    key={path}
                                    className={i === active ? "on" : ""}
                                    onMouseEnter={() => setActive(i)}
                                    onClick={() => go(path)}
                                >
                                    <span>{label}</span>
                                    <small>{path}</small>
                                </li>
                            ))}
                        </ul>
                        <footer>↑ ↓ to move · Enter to open · Esc to close</footer>
                    </div>
                </div>
            )}

            {/* ---------- emergency ---------- */}
            {emergencyOpen && (
                <div className="xmodal-bg" onMouseDown={() => setEmergencyOpen(false)}>
                    <div className="xsos" onMouseDown={(e) => e.stopPropagation()}>
                        <header>
                            <span className="xsos-badge">✚</span>
                            <div>
                                <h3>Emergency contacts</h3>
                                <p>Tap a number to call from a phone.</p>
                            </div>
                            <button onClick={() => setEmergencyOpen(false)} aria-label="Close">×</button>
                        </header>
                        <ul>
                            {HELPLINES.map((h) => (
                                <li key={h.label}>
                                    <div>
                                        <strong>{h.label}</strong>
                                        <small>{h.note}</small>
                                    </div>
                                    <a href={`tel:${h.number.replace(/\s/g, "")}`}>{h.number}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
};

export default Extras;
