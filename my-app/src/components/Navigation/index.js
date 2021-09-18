import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./index.css"

const Navigation = () => {
    // const [isOpen, setOpen] = useState(false);
    return (
       <div className="navigation">
        <nav id="navbar" class="">
        <div class="nav-wrapper">
            <div class="logo">
            <a href="#home"><i class="fa fa-angellist"></i> OnlyMans</a>
            </div>


            <ul id="menu">
                <li><a><Link to="/"> Home</Link> </a></li>
                <li><a> <Link to="/calendar">Calendar</Link> </a></li>
                <li><a> <Link to="/history">History</Link> </a></li>
            </ul>
        </div>
        </nav>



        <div class="menuIcon">
        <span class="icon icon-bars"></span>
        <span class="icon icon-bars overlay"></span>
        </div>


        <div class="overlay-menu">
        <ul id="menu">
            <li><a> <Link to="/">Home</Link> </a></li>
            <li><a> <Link to="/calendar">Calendar</Link> </a></li>
            <li><a> <Link to="/history">History</Link> </a></li>
            </ul>
        </div>
        </div>
    );
};

export default Navigation;