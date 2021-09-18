import React, {Container, Component} from "react";
import { Link } from "react-router-dom";
import { Map, Marker, GoogleApiWrapper } from "google-maps-react"
import "./index.css"

const coords = [43.4757589, -80.5402737]

const style = {
    width: "90%",
    height: "90%"
}

class Home extends Component {
    render () {
        return (
            <div>
                Home
                <Map 
                    google={this.props.google} 
                    zoom={15}
                    initialCenter={{
                    lat: coords[0],
                    lng: coords[1],
                    }}
                    style={style}
                />
            </div>
        )
    }
}

export default GoogleApiWrapper({
    apiKey: ("")
})(Home);