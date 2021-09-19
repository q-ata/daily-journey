import {React, useEffect, useState} from "react";
import Cookies from 'js-cookie'
import RoomIcon from '@mui/icons-material/Room';
import "./App.css"
const {API_KEY, IP} = require("./config.json");

const deg2rad = (deg) => {
  return deg * (Math.PI/180)
}

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);  // deg2rad below
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d * 1000;
}

const fixHeader = (opts) => {
  if (!opts.headers) opts.headers = {};
  opts.credentials = "include";
  const cookie = Cookies.get("csrftoken");
  if (cookie) opts.headers["X-CSRFToken"] = cookie;
  return opts;
};

const LoginPrompt = ({setter}) => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(!Cookies.get("csrftoken"));

  useEffect(() => {
    if (!show) setter(true);
  }, [show]);

  const login = async () => {
    const res = await fetch(`${IP}/api/login`, fixHeader({
      method: "POST",
      body: JSON.stringify({username, password}),
      headers: {"Content-Type": "application/json"},
      credentials: "include"
    }));
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
  const res = await fetch(`${IP}/api/gquery?place_id=${id}`, fixHeader({}));
  const json = await res.json();
  return json;
};

const Journey = ({pos, dist}) => {

  const [niceName, setNiceName] = useState("");
  const [distance, setDistance] = useState(dist);

  useEffect(() => {
    getNearestRoad(pos).then((res) => getPlaceName(res).then((place) => {
      setNiceName(place.result.address_components[0].long_name);
    }));
  }, [pos]);

  return (
    <li key={dist} className="a-run">
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
  const [runninghistory, setRunninghistory] = useState([]);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (!logged) return;
    fetch(`${IP}/api/runhistory`, fixHeader({})).then((r) => r.json().then((res) => {
      console.log(res);
      const items = res.map((r) => {
        const d = new Date(r.time);
        return {date: `${d.getMonth() + 1}/${d.getDate() + 1}`, distance: r.distance, time: d};
      }).sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 7).reverse();
      setRunninghistory(items);
    }));
    fetch(`${IP}/api/savedpath`, fixHeader({})).then((r) => r.json().then((res) => {
      console.log(res);
      const savePaths = [];
      for (const path of res) {
        const pts = JSON.parse(path.pathpoints);
        let tot = 0;
        for (let i = 0; i < pts.length - 1; i++) tot += getDistance(...pts[i], ...pts[i + 1]);
        tot = Math.round(tot);
        savePaths.push({path: pts, distance: tot});
      }
      setSavedPaths(savePaths);
    }));
  }, [logged]);

  const inserter = (center, coords) => {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.innerHTML = `
    initMap = () => {
      const center = {lat: ${center[0]}, lng: ${center[1]}};
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
    setActive(!!paths.length);
    if (paths.length) inserter(paths[activeMap].center, paths[activeMap].path.map((d) => {
      return {lat: parseFloat(d[0]), lng: parseFloat(d[1])};
    }));
  }, [paths, activeMap]);

  return (
    <div style={{width: "100%", height: "100%"}}>
      <LoginPrompt setter={setLogged} />
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
          <div className="gogogo" onClick={async () => {
            const [lat, lon] = search.split(",");
            if (!lat || !lon) return;
            const [plat, plon] = [parseFloat(lat), parseFloat(lon)];
            if (isNaN(plat) || isNaN(plon)) return;
            const res = await fetch(`${IP}/api/map?center=${plat},${plon}&distance=${distance}`, fixHeader({
              method: "GET",
              headers: {"Content-Type": "application/json"}
            }));
            const json = await res.json();
            const data = json.map((p) => {
              return {...p, center: [plat, plon]};
            });
            setPaths(data.slice(0, 5));
          }}>
            Find A Journey!
          </div>
          <div className="additional-buttons" style={{display: paths.length ? "inline-block" : "none"}}>
            <div className="save-path" onClick={async () => {
              console.log({pathpoints: paths[activeMap].path});
              const res = await fetch(`${IP}/api/savedpath/`, fixHeader({
                method: "POST",
                body: JSON.stringify({pathpoints: JSON.stringify(paths[activeMap].path)}),
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
              const res = await fetch(`${IP}/api/runhistory/`, fixHeader({
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
          <div className="chart-wrap vertical">  
              <div className="grid">
          {runninghistory.map((rh, i) => {
            return (
              <div key={i} className="bar" style={{width: `${rh.distance/20}px`}} data-name={rh.date} title={rh.date}></div>   
            );
          }
          )}
          </div>
            </div>
        </div>
      </div>
    </div>
  );

};

export default App;