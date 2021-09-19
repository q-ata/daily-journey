import {React, useEffect, useState} from "react";
import Cookies from 'js-cookie'
import RoomIcon from '@mui/icons-material/Room';
import "./App.css"
const {API_KEY, IP} = require("./config.json");

const fixHeader = (opts) => {
  if (!opts.headers) opts.headers = {};
  opts.credentials = "include";
  const cookie = Cookies.get("csrftoken");
  if (cookie) opts.headers["X-CSRFToken"] = cookie;
  return opts;
};

const LoginPrompt = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(true);

  const login = async () => {
    const res = await fetch(`${IP}/api/login`, fixHeader({
      method: "POST",
      body: JSON.stringify({username, password}),
      headers: {"Content-Type": "application/json"},
      credentials: "include"
    }));
    console.log(res);
    return await res.json();
  };

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
            <input className="pass-prompt" type="password" onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="login-submit" onClick={async (e) => {
          const res = await login();
          console.log(res);
          fetch(`${IP}/api/runhistory`, fixHeader({})).then((r) => r.json().then((res) => {
            console.log("RUN HISTORY");
            console.log(res);
          }));
          fetch(`${IP}/api/savedpath`, fixHeader({})).then((r) => r.json().then((res) => {
            console.log("SAVED PATHS");
            console.log(res);
          }));
          setShow(false);
        }}>
          Login
        </div>
      </div>
    </div>
  );
};

const getNearestRoad = async (loc) => {
  const res = await fetch(`https://roads.googleapis.com/v1/nearestRoads?points=${loc[0]},${loc[1]}&key=${API_KEY}`);
  const json = await res.json();
  // If no suitable POI, use some random place in Africa
  if (!json || !json.snappedPoints || !json.snappedPoints[0]) return "ChIJibXlCJOI_xkRAsO6cFyg0Ro";
  return json.snappedPoints[0].placeId;
};

const getPlaceName = async (id) => {
  const res = await fetch(`${IP}/api/gquery?place_id=${id}&key=${API_KEY}`);
  const json = await res.json();
  return json;
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

  const [distance, setDistance] = useState(2000);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(false);
  const [activeMap, setActiveMap] = useState(0);
  const [paths, setPaths] = useState([]);
  const [savedPaths, setSavedPaths] = useState([]);

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
    /*
    (async () => {
      const id = await getNearestRoad([43.47666644427674,-80.5390365754832]);
      const data = await getPlaceName(id);
      console.log(data);
    })();
    */
  }, []);

  useEffect(() => {
    setActive(!!paths.length);
    if (paths.length) inserter(paths[activeMap].center, paths[activeMap].path.map((d) => {
      return {lat: parseFloat(d[0]), lng: parseFloat(d[1])};
    }));
  }, [paths, activeMap]);

  return (
    <div style={{width: "100%", height: "100%"}}>
      <LoginPrompt />
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
          <div className="gogogo" onClick={async () => {
            const [lat, lon] = search.split(",");
            if (!lat || !lon) return;
            const [plat, plon] = [parseFloat(lat), parseFloat(lon)];
            if (isNaN(plat) || isNaN(plon)) return;
            console.log({center: [plat, plon], distance});
            const res = await fetch(`${IP}/api/map?center=${plat},${plon}&distance=${distance}`, fixHeader({
              method: "GET",
              body: JSON.stringify({center: [plat, plon], distance}),
              headers: {"Content-Type": "application/json"}
            }));
            const json = await res.json();
            const data = json.map((p) => {
              return {...p, center: [plat, plon]};
            });
            setPaths(data.slice(0, 5));
            /*
            const parsed = (active ? data : data2).map((d) => {
              const pair = d.split(",");
              return {lat: parseFloat(pair[0]), lng: parseFloat(pair[1])};
            });
            inserter(parsed[0], parsed);
            */
          }}>
            Find A Journey!
          </div>
          <div className="additional-buttons" style={{display: paths.length ? "inline-block" : "none"}}>
            <div className="save-path" onClick={async () => {
              console.log({pathpoints: paths[activeMap]});
              const res = await fetch(`${IP}/api/savedpath`, fixHeader({
                method: "POST",
                body: JSON.stringify({pathpoints: paths[activeMap]}),
                headers: {"Content-Type": "application/json"}
              }));
              console.log(res.json());
            }}>
              Save This Journey!
            </div>
            <div className="finished" onClick={async () => {
              const now = new Date();
              const conv = (val) => {
                if (val < 10) return `0${val}`;
                else return val;
              };
              const dateString = `${now.getYear() + 1900}-${conv(now.getMonth())}-${conv(now.getDate())}T${conv(now.getHours())}:${conv(now.getMinutes())}`;
              console.log({distance: paths[activeMap].distance, time: dateString});
              const res = await fetch(`${IP}/api/runhistory`, fixHeader({
                method: "POST",
                body: JSON.stringify({distance: paths[activeMap].distance, time: dateString}),
                headers: {"Content-Type": "application/json"}
              }));
            }}>
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

          {/*For Catherine*/}

        </div>
      </div>
    </div>
  );

};

export default App;
