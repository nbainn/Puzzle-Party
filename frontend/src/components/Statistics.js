import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import "./Statistics.css";
import CatStats1 from "../assets/CatStats1.gif";
import CatStats2 from "../assets/CatStats2.gif";
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const Statistics = () => {
  // Your code for fetching and storing user statistics goes here
  const { userId } = useParams();
  const [stats, setStats] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      console.log("userId:", userId);
      if (userId) {
        // Fetch user statistics using the userId
        // Update the stats state variable
        try {
          const resp = await axios.get("/get-statistics", {
            params: { userId: userId },
          });
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

  const [showSecondGif, setShowSecondGif] = useState(false);

  const handleFirstGifLoad = () => {
    // First GIF has finished loading, switch to the second GIF
    const timeoutId = setTimeout(() => {
      setShowSecondGif(true);
    }, 4960);
  };

  return (
    <div>
      <div className="statistics-header">
        <h1>User Statistics</h1>
      </div>
      <div className="statistics">
        <div className="stats-sub">
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
        </div>

        <div className="stats-sub">
          {globalStats ? (
            <div>
              <p>Global Games Played: {globalStats.gamesPlayed} </p>
              <p>Global Games Won: {globalStats.gamesWon}</p>
              <p>
                Global Games Lost:{" "}
                {globalStats.gamesPlayed - globalStats.gamesWon}
              </p>
              <p>Global Time Played: {globalStats.timePlayed} seconds </p>
            </div>
          ) : (
            <p>No global stats yet!</p>
          )}
        </div>
      </div>
      {showSecondGif ? (
        <img src={CatStats2} alt="Second GIF" className="stat-image" />
      ) : (
        <img
          src={CatStats1}
          alt="First GIF"
          className="stat-image"
          onLoad={handleFirstGifLoad}
        />
      )}
    </div>
  );
};

export default Statistics;
