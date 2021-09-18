import React, {Container, Component} from "react";
import { Link } from "react-router-dom";
import { Map, Marker, GoogleApiWrapper } from "google-maps-react"
import "./index.css"
const key = require("./api-key.json").key;

const coords = [43.4757589, -80.5402737]

const style = {
    border: "5px solid black",
    margin: "2vh",
    width: "98%",
    height: "90%"
}

class Home extends Component {
    render () {
        return (
            <div className="google-maps">
                <Map 
                    google={this.props.google} 
                    zoom={15}
                    initialCenter={{
                    lat: coords[0],
                    lng: coords[1],
                    }}
                    style={style}>
                    <Marker />
                </Map>
            </div>
        )
    }
}

export default GoogleApiWrapper({
    apiKey: (key)
})(Home);