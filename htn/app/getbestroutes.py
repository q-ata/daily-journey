import sys
from typing import List
from random import choices
import json
sys.setrecursionlimit(10000000)

MIN_INTERSECTIONS, MAX_INTERSECTIONS = [20, 500]
MIN_DIST, MAX_DIST = [1000, 4000]
DESIRED_DIST = 2000

global vis, graph, cycles

rel_path = "my-app/ryans_magic_algo/"
with open(rel_path + "graph.json") as f:
    graph = json.load(f)
    f.close()

cycles = []

def create_dict(graph):
    return {v:0 for v in graph.keys()}

def addEdge(u, v, w):
    if graph.get(u) is None:
        graph[u] = [(v, w)]
    else:
        graph[u].append((v, w))

    if graph.get(v) is None:
        graph[v] = [(u, w)]
    else:
        graph[v].append((u, w))


def dfs_cycle(start, v, path, dist):
    vis[v] = 1
    path.append(v)
    for u, wt in graph[v]:
        if u == start:
            if len(path) < MIN_INTERSECTIONS or len(path) > MAX_INTERSECTIONS:
                continue
            if dist + wt < MIN_DIST or dist + wt > MAX_DIST:
                continue
            cycles.append([dist + wt, len(path)+1, path.copy() + [u]])
        elif vis[u] > 0:
            continue
        elif vis[u] == 0:
            dfs_cycle(start, u, path.copy(), dist + wt)

    vis[v] = 2
    return False

close_to_desired = lambda l: abs(l[0] - DESIRED_DIST)

def get_best_routes(g):
    global graph, vis, cycles
    graph = g
    nodes = list(graph.keys())

    for node in choices(nodes, k=500): # nodes:
        root = node
        vis = create_dict(graph)
        dfs_cycle(root, root, [], 0)

    cycles = sorted(cycles, key=close_to_desired)[:10]

    paths = []

    for m, i, path in cycles:
        L = len(path)
        step = max(1, int(L/100))
        paths.append({"distance (meters)" : m, "intersections" : i, "lat/long path": path[slice(0, L, step)]})

    return paths

#print(get_best_routes(graph))