# Hack The North 2021

Inspiration: 
Haven't been outside in years. I definitely won't be able to find a path to walk around my neighborhood without getting lost.


What it does: 
The website receives user input on where they want to begin the walk as well as the distance they wish to walk. The application will generate several path suggestions that circle around the starting point in approximately the distance they desire.


Challenges we ran into: 
Our biggest challenge was in writing to the path finding algorithm. We realized that finding the desired length circular paths was an NP problem so we had to work around the issue and approach the algorithm in a different way.

We also had a difficult time trying to get the map data we needed and getting the Google Maps APIs to draw out the paths we mapped out separately.


How we built it:
Front end with React, back end with Django and PostgreSQL. 

