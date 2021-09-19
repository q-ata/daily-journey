import overpy
import requests
import geopy.distance

class Way:
  def __init__(self, obj):
    self.id = obj["id"]
    self.nodes = obj["nodes"]


class Mapper:

  def __init__(self):
    self.api = overpy.Overpass()

  def getWays(self, bb):
    s = bb["s"]
    w = bb["w"]
    n = bb["n"]
    e = bb["e"]
    res = requests.get(f"https://overpass-api.de/api/interpreter?data=[out:json];way({s},{w},{n},{e});out;")
    return res.json()["elements"]

  def parseNodeArgs(self, nodeIDs):
    strs = []
    for n in nodeIDs:
      strs.append(f"node({n});")
    return "".join(strs)
  
  def createGraph(self, jWays):
    ways = []
    for way in jWays:
      ways.append(Way(way))
    graph = {}
    positions = {}
    nodeIDs = set()
    for w in ways:
      for node in w.nodes:
        nodeIDs.add(str(node))
    nodeStrs = self.parseNodeArgs(nodeIDs)
    oRes = self.api.query(f"[out:json];({nodeStrs});out;")
    for n in oRes.nodes:
      graph[str(n.lat) + "," + str(n.lon)] = []
      positions[str(n.id)] = [str(n.lat), str(n.lon)]
    for w in ways:
      for i in range(len(w.nodes) - 1):
        cNode = str(w.nodes[i])
        nNode = str(w.nodes[i + 1])
        # TODO: Calculate distance
        cCoord = positions[cNode]
        nCoord = positions[nNode]
        dist = round(geopy.distance.geodesic(cCoord, nCoord).m)
        graph[f"{cCoord[0]},{cCoord[1]}"].append([f"{nCoord[0]},{nCoord[1]}", dist])
        graph[f"{nCoord[0]},{nCoord[1]}"].append([f"{cCoord[0]},{cCoord[1]}", dist])
    return {"graph": graph, "positions": positions}

  def getMap(self, center, distance):
    if distance < 2000:
      distance = 2000
    increments = distance/200
    bb = {
      "s": center[0] - 0.001 * increments,
      "n": center[0] + 0.001 * increments,
      "w": center[1] - 0.001 * increments,
      "e": center[1] + 0.001 * increments
    }
    allWays = self.getWays(bb)
    filtWays = []
    for way in allWays:
      try:
        if not way["tags"]["highway"] in ["footway", "cycleway", "path", "service", "track"]:
          filtWays.append(way)
      except:
        pass
    return self.createGraph(filtWays)