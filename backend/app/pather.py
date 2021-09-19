import sys
from typing import List
from random import choices
import json
import os
from decimal import Decimal
sys.setrecursionlimit(10000000)

class Pather:
  def __init__(self):
    self.MIN_INTERSECTIONS = 20
    self.MAX_INTERSECTIONS = 500
    self.MIN_DIST = 400
    self.MAX_DIST = 4000

  def create_dict(self, graph):
    return {v:0 for v in graph.keys()}

  def addEdge(self, u, v, w):
    if self.graph.get(u) is None:
      self.graph[u] = [(v, w)]
    else:
      self.graph[u].append((v, w))

    if self.graph.get(v) is None:
      self.graph[v] = [(u, w)]
    else:
      self.graph[v].append((u, w))

  def dfs_cycle(self, start, v, path, dist):
    self.vis[v] = 1
    path.append(v)
    for u, wt in self.graph[v]:
      if u == start:
        if len(path) < self.MIN_INTERSECTIONS or len(path) > self.MAX_INTERSECTIONS:
          continue
        if dist + wt < self.MIN_DIST or dist + wt > self.MAX_DIST:
          continue
        self.cycles.append([dist + wt, len(path)+1, path.copy() + [u]])
      elif self.vis[u] > 0:
        continue
      elif self.vis[u] == 0:
        self.dfs_cycle(start, u, path.copy(), dist + wt)
    self.vis[v] = 2
    return False

  def convertToArray(self, path):
    decimalArr = []
    for string in path:
      splitArr = string.split(",")
      decimalArr.append([Decimal(splitArr[0]), Decimal(splitArr[1])])
    return decimalArr
  
  def get_best_routes(self, g, desired):
    self.graph = g
    self.cycles = []
    nodes = list(self.graph.keys())

    for node in choices(nodes, k=500): # nodes:
      root = node
      self.vis = self.create_dict(self.graph)
      self.dfs_cycle(root, root, [], 0)

    close_to_desired = lambda l: abs(l[0] - desired)
    self.cycles = sorted(self.cycles, key=close_to_desired)[:10]

    paths = []
    prevDis = 0

    for m, i, path in self.cycles:
      L = len(path)
      step = max(1, int(L/100))
      if m != prevDis:
        paths.append({"distance" : m, "intersections" : i, "path": self.convertToArray(path[slice(0, L, step)])})
        prevDis = m

    return paths