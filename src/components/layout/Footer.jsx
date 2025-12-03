import React from "react";
import "../../pages/HomePage/HomePage.css";
import {FaDiscord, FaGithub, FaInstagram} from "react-icons/fa";

const Footer = () => {
    return (
        <section className="th-bottom-section">
            <div className="th-about-block">
                <h2 className="th-about-title">Tattoo Hunter</h2>
                <p className="th-about-text">
                    Платформа для поиска тату-мастеров, сотрудников и вакансий в индустрии.
                    Объединяем мастеров и салоны по всей стране.
                </p>
            </div>

            <div className="th-socials">
                <a href="https://github.com/Kon-sys" target="_blank" rel="noreferrer">
                    <FaGithub/>
                </a>
                <a href="https://discord.com" target="_blank" rel="noreferrer">
                    <FaDiscord/>
                </a>
                <a href="https://www.instagram.com/likhtar.i/" target="_blank" rel="noreferrer">
                    <FaInstagram/>
                </a>
            </div>
        </section>
    );
};

export default Footer;
