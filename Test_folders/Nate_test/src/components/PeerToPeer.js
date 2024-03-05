import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PeerToPeer.css'; 
//import {fetchHost} from '../sequelize.tsx';
//import {sq} from '../sequelize.tsx';
import e from 'cors';
import axios from 'axios';

function PeerToPeer() {
    return (

        <body>

        <button onclick="createHost()">Connect as Host</button>
        <button onclick="createPeer()">Connect as Client</button>

        <button onclick = "sendCoordinates(0, 0)">Send Coordinate</button>
        <button onclick="sendCoordinates(0, 1)">Send Coordinate</button>
        <button onclick="sendCoordinates(0, 2)">Send Coordinate</button>

        <label for="favcolor">Select your Cursor Color:</label>
        <input type="color" id="favcolor" name="favcolor" value="#ff0000"> </input>

        <button onclick="sendColor(document.getElementById('favcolor').value)">Send Color</button>


        <script src="testing2.js"></script>
        <script>
        loadScript();
        </script>
    </body>
    )
};