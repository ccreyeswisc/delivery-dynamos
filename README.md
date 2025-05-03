# Delivery Dynamos (CS 620 Capstone -- Schneider Team 2)

## Link

https://github.com/ccreyeswisc/delivery-dynamos/

## Installation

After cloning the repository, perform the following steps:

1. In `/backend` and `/frontend/delivery-dynamos-website/`, create `.env` files from their templates using your PC Miler API key.
2. Activate the virtual environment by running `source venv/bin/activate` in the source directory.
3. Ensure that `/backend/routes.db` exists. If not, run `python3 init.py` from the /backend/ directory.
4. Run the backend, `flask_app.py`, in the `/backend` directory: `python3 flask_app.py`.
5. In a separate terminal, run the frontend in `/frontend/delivery-dynamos-website` using `npm run dev`.
6. Open `localhost:5173` on your browser.

Note: Dockerfiles to run the backend and frontend have issues with npm's optional dependencies, and are not functional.

## Overview

Our app is a map-based web application designed to assist Schneider’s clients in finding the most suitable routes based on their specific needs. The application prioritizes UI-friendliness, efficiency, and respect for users' time, providing valuable route insights to enhance decision-making. Our general program flows as such:

1. User inputs search parameters from Search Modal

2. Backend:

     Processes date ranges

     Pings geolocation API to grab valid ZIP codes from search locations and radii

     Grabs data from SQL tables and filters based on parameters

3. Frontend displays data on-screen in map/sidebar components


## Features

- Map-Based Search: Displays routes visually with key information cards for each route.
- Pickup & Drop-Off Points: Clearly marks start and end locations.
- Radius Indicators: Highlights proximity around start and end points.
- Route Map Filters: Filters displayed routes based on pickup and dropoff dates

## Future Features

Given more time, here are some features we would want to implement:

- Buffer for search radius (Given a search of 100 miles, display an extra 20 miles past to show drivers any routes that are just beyond their search)
- Route ranking based on user preferences for miles, price, dates, etc.
- Weather updates for the search area and dates

## Tech Stack

* Frontend: React.js, Vite, React Bootstrap, Material UI
* Backend: Python, Flask
* Mapping: PC Miler
* Data Processing/Storage: pandas, SQLite
* Containerization: Docker 
