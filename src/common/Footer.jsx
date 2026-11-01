import "./common.css";

const Footer = () => {

    return (
        <footer className="common-footer">

            <div>
                © {new Date().getFullYear()} Thilak Hospital
            </div>

            <div>
                Compassionate care, every day
            </div>

        </footer>
    );
};

export default Footer;