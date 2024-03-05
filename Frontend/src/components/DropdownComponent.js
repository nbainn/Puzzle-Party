import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DropdownComponent.css";
//import {fetchHost} from '../sequelize.tsx';
//import {sq} from '../sequelize.tsx';
import e from "cors";
import axios from "axios";

const DropdownComponent = () => {
  const [selectedSize, setSelectedSize] = useState("");

  const handleSizeChange = (event) => {
    setSelectedSize(event.target.value);
  };

  return (
    <div>
      <label htmlFor="sizeDropdown">Select Size:</label>
      <select
        id="sizeDropdown"
        value={selectedSize}
        onChange={handleSizeChange}
      >
        <option value="">Select Size</option>
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>

      {selectedSize && <p>Selected Size: {selectedSize}</p>}
    </div>
  );
};

export default DropdownComponent;
