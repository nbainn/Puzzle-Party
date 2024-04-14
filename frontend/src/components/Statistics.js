import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Statistics = () => {
    // Your code for fetching and storing user statistics goes here
    const {userId} = useParams();
    const [stats, setStats] = useState(null);
    const [globalStats, setGlobalStats] = useState(null);

    useEffect(() => {
        async function fetchStats() {
            console.log("userId:", userId);
            if (userId) {
                // Fetch user statistics using the userId
                // Update the stats state variable
                try {
                    const resp = await axios.get("/get-statistics", { params: {userId: userId }});
                    if (resp.status === 200) {
                        setStats(resp.data);
                    }
                } catch (error) {
                    console.error("Error contacting server", error);
                    console.log("error");
                } 
            }
        }
        fetchStats();
    }, [userId]);
    
    useEffect(() => {
        async function fetchGlobalStats() {
            try {  
                const resp = await axios.get("/get-global-statistics");
                if (resp.status === 200) {
                    setGlobalStats(resp.data);
                }
            } catch (error) {
                console.error("Error contacting server", error);
                console.log("error");
            } 
        }
    fetchGlobalStats();
    }, []);
    
    return (
        <div>
            <h1>User Statistics</h1>
            
            {stats ? (
                <div>
                    <p>Games Played: {stats.gamesPlayed}</p>
                    <p>Games Won: {stats.gamesWon}</p>
                    <p>Games Lost: {stats.gamesPlayed - stats.gamesWon}</p>
                    <p>Time Played: {stats.timePlayed} seconds </p>
                </div>
            ) : (
                <p>No user stats yet!</p>
            )}
            {globalStats ? (
                <div>
                    <p>Global Games Played: {globalStats.gamesPlayed}</p>
                    <p>Global Games Won: {globalStats.gamesWon}</p>
                    <p>Global Games Lost: {globalStats.gamesPlayed - globalStats.gamesWon}</p>
                    <p>Global Time Played: {globalStats.timePlayed} seconds </p>
                </div>
                ) : (
                    <p>No global stats yet!</p>
                )}
        </div>
    );
};

export default Statistics;