import BedSidebar from "./BedSidebar";
import "./bed.css";

const BedSubpageLayout = ({ children }) => (
    <div className="bed-layout">
        <BedSidebar />
        <main className="bed-main bed-subpage-main">{children}</main>
    </div>
);

export default BedSubpageLayout;
