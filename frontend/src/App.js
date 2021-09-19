import {React, useEffect, useState} from "react";
import Cookies from 'js-cookie'
import RoomIcon from '@mui/icons-material/Room';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import "./App.css"

const key = "PLACEHOLDER";
const runninghistory = [
  { date: "09/12", distance: 400},
  { date: "09/13", distance: 2000},
  { date: "09/14", distance: 4000},
  { date: "09/15", distance: 1504},
  { date: "09/16", distance: 1222},
  { date: "09/17", distance: 1504},
  { date: "09/18", distance: 1222},
];


const LoginPrompt = ({setter}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  return (
    <div className="login-cover" style={{display: show ? "block" : "none"}}>
      <div className="login-prompt">
        <div className="login-section">
          <div className="username">
            <span className="user-label">Username:</span>
            <input className="user-prompt" type="text" onChange={(e) => setUsername(e.target.value)} /><br />
          </div>
          <div className="password">
            <span className="pass-label">Password:</span>
            <input className="pass-prompt" type="text" onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="login-submit" onClick={(e) => {
          setShow(false);
          setter({username, password})
        }}>
          Login
        </div>
      </div>
    </div>
  );
};

const getNearestRoad = async (loc) => {
  const res = await fetch(`https://roads.googleapis.com/v1/nearestRoads?points=${loc[0]},${loc[1]}&key=${key}`);
  const json = await res.json();
  // If no suitable POI, use some random place in Africa
  if (!json || !json.snappedPoints || !json.snappedPoints[0]) return "ChIJibXlCJOI_xkRAsO6cFyg0Ro";
  return json.snappedPoints[0].placeId;
};

const getPlaceName = async (id) => {
  // const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&key=${key}`);
  // const json = await res.json();
  return {long_name: "Tim Hortons", short_name: "Tim Hortons"};
};

const Journey = ({pos, dist}) => {

  const [niceName, setNiceName] = useState("");
  const [distance, setDistance] = useState(dist);

  useEffect(() => {
    getNearestRoad(pos).then((res) => getPlaceName(res).then((place) => setNiceName(place.long_name)));
  }, [pos]);

  return (
    <li className="a-run">
      <div className="start-name">
        {niceName}
      </div>
      <div className="saved-dist">
        <span>{distance} meters</span>
      </div>
    </li>
  );
}; 

const App = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [distance, setDistance] = useState(2000);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(false);
  const [activeMap, setActiveMap] = useState(0);
  const [paths, setPaths] = useState([]);
  const [savedPaths, setSavedPaths] = useState([{path: [[1, 1]], distance: 1200}]);

  const inserter = (center, coords) => {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.innerHTML = `
    initMap = () => {
      const center = {lat: ${center.lat}, lng: ${center.lng}};
      const map = new google.maps.Map(document.getElementsByClassName("map-display")[0], {
        zoom: 16,
        center,
        mapTypeId: "terrain"
      });
      const flightPlanCoordinates = ${JSON.stringify(coords)};
      const flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: "#00F",
        strokeOpacity: 1.0,
        strokeWeight: 4
      });
      new google.maps.Marker({
        position: center,
        map,
        title: "You are here!",
      });
    
      flightPath.setMap(map);
    };
    initMap();
    `;
    document.body.appendChild(s);
  };

  useEffect(() => {
    (async () => {
      const id = await getNearestRoad([43.47666644427674,-80.5390365754832]);
      const data = await getPlaceName(id);
      console.log(data);
    })();
  }, []);

  useEffect(() => {
    setActive(!!paths.length)
  }, [paths]);

  return (
    <div style={{width: "100%", height: "100%"}}>
      <LoginPrompt setter={({u, p}) => {
        setUsername(u);
        setPassword(p);
      }} />
      <div className="top-bar">
        <img src="./logo.png" alt="logo" />
        <span className="name">
          Daily Journey
        </span>
      </div>
      <div className="container">
        <div className="map-area">
          <div className="map-selector">
            <ul className="maps">
              {(paths.length ? paths : [0]).map((p, idx) => {
                return (
                  <li key={idx} className={`map-instance${activeMap === idx ? " active-map" : ""}`} onClick={() => {
                    setActiveMap(idx);
                  }}>
                    Route {idx + 1}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="map-display">
            <span className="map-placeholder" style={{display: active ? "none": "inline-block"}}>Click 'Find A Path' to start your journey!</span>
          </div>
        </div>
        <div className="search">
          <span className="search-header">Choose A Starting Point</span><br />
          <div className="search-area">
            <input type="text" className="search-box" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="my-location" onClick={() => {
              navigator.geolocation.getCurrentPosition((loc) => {
                setSearch(`${loc.coords.latitude}, ${loc.coords.longitude}`);
              });
            }}><RoomIcon /></div>
          </div>
          <span className="dist-header">Desired Distance</span><br />
          <input type="range" className="distance" min="400" max="4000" step="100" onChange={(e) => setDistance(e.target.value)} value={distance} />
          <input type="text" className="dist-val" onChange={(e) => {
            if (isNaN(e.target.value)) return;
            setDistance(e.target.value);
          }} value={distance} onBlur={(e) => {
            if (distance < 400) setDistance(400);
            else if (distance > 4000) setDistance(4000);
          }} /> meters<br />
          {/*<div className="stopby">
            <div className="stop-cafe">
              <LocalCafeIcon />
            </div>
            <div className="stop-shop">
              <ShoppingCartIcon />
            </div>
            </div>*/}
          <div className="gogogo" onClick={() => {
            const data = ['43.4729066,-80.5338804', '43.4729572,-80.5340549', '43.4732763,-80.5342911', '43.4756905,-80.5360944', '43.4777285,-80.5375786', '43.4779120,-80.5373296', '43.4784467,-80.5357971', '43.4786125,-80.5352214', '43.4766695,-80.5338455', '43.4765614,-80.5338998', '43.4761104,-80.5348463', '43.4750745,-80.5341077', '43.4742166,-80.5334892', '43.4733808,-80.5328807', '43.4729066,-80.5338804'];
            const data2 = ['43.4746485,-80.5461679', '43.4771810,-80.5479446', '43.4780464,-80.5485202', '43.4796923,-80.5497561', '43.4801376,-80.5502983', '43.4802597,-80.5492803', '43.4835721,-80.5463119', '43.4855355,-80.5446107', '43.4852818,-80.5404216', '43.4830324,-80.5412391', '43.4804932,-80.5421659', '43.4770339,-80.5399727', '43.4758539,-80.5429470'];
            const parsed = (active ? data : data2).map((d) => {
              const pair = d.split(",");
              return {lat: parseFloat(pair[0]), lng: parseFloat(pair[1])};
            });
            inserter(parsed[0], parsed);
            setActive(true);
          }}>
            Find A Journey!
          </div>
          <div className="additional-buttons" style={{display: paths.length ? "inline-block" : "none"}}>
            <div className="save-path">
              Save This Journey!
            </div>
            <div className="finished">
              Journey Finished!
            </div>
          </div><br />
          <span className="info" style={{display: paths.length ? "inline-block" : "none"}}>
            The selected journey is {paths.length ? paths[activeMap].distance : ""} meters!
          </span>
        </div>
      </div>
      <div className="stat-track">
        <div className="saved-runs">
          <div className="saved-header">
            Saved Journeys
          </div>
          <ul className="runs">
            {savedPaths.map((p) => {
              return <Journey pos={p.path[0]} dist={p.distance} />
            })}
          </ul>
        </div>
        <div className="history">
          <div className="history-header">
            Journey History
          </div>
          <div class="chart-wrap vertical">  
              <div class="grid">
          {runninghistory.map((rh) => {
            return (
                <div class="bar" style={{width: `${rh.distance/20}px`}} data-name={rh.date} title={rh.date}></div>   
            )
          }
          )}
          </div>
            </div>
          { }
        </div>
      </div>
    </div>
  );

};

export default App;
