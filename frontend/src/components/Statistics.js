import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, Paper } from "@mui/material";
import { styled } from '@mui/material/styles';
import './Statistics.css';
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

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
        <div className = "statistics">
            <h1>User Statistics</h1>
            
            <Box>
            <Grid container spacing={2}>
            {stats ? (
                <div>
                    <Grid item xs={20}>
                        <Item>Games Played: {stats.gamesPlayed}</Item>
                        <Item>Games Won: {stats.gamesWon}</Item>
                        <Item>Games Lost: {stats.gamesPlayed - stats.gamesWon}</Item>
                        <Item>Time Played: {stats.timePlayed} seconds </Item>
                    </Grid>
                </div>
            ) : (
                <Grid item xs={20}>
                    <Item>No user stats yet!</Item>
                </Grid>
            )}      

            {globalStats ? (
                <div>
                    <Grid item xs={20}>
                    <Item>Global Games Played: {globalStats.gamesPlayed} </Item>
                    <Item>Global Games Won: {globalStats.gamesWon}</Item>
                    <Item>Global Games Lost: {globalStats.gamesPlayed - globalStats.gamesWon}</Item>
                    <Item>Global Time Played: {globalStats.timePlayed} seconds </Item>
                    </Grid>
                </div>
                ) : (
                    <p>No global stats yet!</p>
                )}
                
                </Grid>
            </Box>
        </div>
    );
};

export default Statistics;