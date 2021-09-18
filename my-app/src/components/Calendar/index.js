import React, {Container, Component} from "react";
import { Link } from "react-router-dom";
import Cal from 'react-calendar';
import "./index.css"

const Calendar = () => {
    return (
        <div>
            Calendar
            <Cal />
        </div>
    )
}

export default Calendar;