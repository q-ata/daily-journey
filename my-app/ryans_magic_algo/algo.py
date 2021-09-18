import sys
from typing import List
from random import choices
import json
import os
sys.setrecursionlimit(10000000)

print(os.getcwd())

rel_path = "my-app/ryans_magic_algo/"

with open(rel_path + "graph.json") as f:
    global graph
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


MIN_INTERSECTIONS, MAX_INTERSECTIONS = [20, 500]
MIN_DIST, MAX_DIST = [1000, 4000]


def dfs_cycle(start, v, path, dist):
    vis[v] = 1
    path.append(v)
    for u, wt in graph[v]:
        if u == start:
            if len(path) < MIN_INTERSECTIONS or len(path) > MAX_INTERSECTIONS:
                continue
            if dist + wt < MIN_DIST or dist + wt > MAX_DIST:
                continue
            cycles.append((f"{dist + wt} meters", f"{len(path)+1} intersections", path.copy() + [u]))
        elif vis[u] > 0:
            continue
        elif vis[u] == 0:
            dfs_cycle(start, u, path.copy(), dist + wt)

    vis[v] = 2
    return False


if __name__ == "__main__":
    nodes = list(graph.keys())

    for node in choices(nodes, k=100): # nodes:
        root = node
        vis = create_dict(graph)
        dfs_cycle(root, root, [], 0)
    
    with open(rel_path + "paths.txt", "w") as g:
        for m, i, path in cycles:
            L = len(path)
            step = max(1, int(L/30))
            g.write(f"{m}, {i}, {str(path[slice(0, L, step)])} \n\n")
        g.close()
