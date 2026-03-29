# FoodInspect

## Table of Contents

1. [Overview](#overview)  
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)  
   - [Prerequisites](#prerequisites)
   - [Setup](#setup) 

## Overview

FoodInspect is a Google Chrome web-browser extension that displays restaurants' latest food inspection ratings from a public NYC agency dataset on Google Maps.

## Technologies Used

- **Frontend**: JavaScript, HTML, CSS
- **Data**: pandas, sodapy (NYC Open Data) 

## Installation

To run the project locally, follow these steps:

### Prerequisites

Before installing, ensure you have pip installed

### Setup

1. Clone the repository:
    - ```git clone``` 
    - ```cd``` into repository 

2. Install dependencies and run:
    ```bash
    cd dataSets
    pip install pandas
    pip install sodapy
    ```

3. Loading the Extension into chrome:
    - navigate to `chrome://extensions/`
    - Toggle Developer mode switch on the top right to **ON**
    - Click on load unpacked button in the top left
    - navigate to and select the project folder, and click confirm