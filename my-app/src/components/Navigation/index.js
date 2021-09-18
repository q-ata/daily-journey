import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./index.css"

const Navigation = () => {
    // const [isOpen, setOpen] = useState(false);
    return (
       <div className="navigation">
            <a>
                <Link to="/">Home</Link>
            </a>
            <a>
                <Link to="/calendar">Calendar</Link>
            </a>
            <a>
                <Link to="/history">History</Link>
            </a>
        </div>
    );
};

export default Navigation;