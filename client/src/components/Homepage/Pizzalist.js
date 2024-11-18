import { Pizza } from "./Pizza.js";
import { useEffect, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear"; // Clear icon
import { useHistory } from "react-router-dom";
import { API_URL } from "../../globalconstant.js";

export function Pizzalist() {
  const history = useHistory();
  const [pizzas, setpizzas] = useState([]);
  const [filteredPizzas, setFilteredPizzas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/pizzas`)
      .then((data) => data.json())
      .then((pizzas) => {
        setpizzas(pizzas);
        setFilteredPizzas(pizzas);
      });
  }, []);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = pizzas.filter((pizza) =>
      pizza.name.toLowerCase().includes(term)
    );
    setFilteredPizzas(filtered);
  };

  // Clear the search bar input when clicking the clear button
  const clearSearch = () => {
    setSearchTerm("");
    setFilteredPizzas(pizzas);
  };

  const Username = localStorage.getItem("Username");
  if (!Username) {
    history.push("/");
  }

  return (
    <div className="pizzas-list">
      {/* Search Bar */}
      <div style={{ margin: "20px 0", textAlign: "center" }}>
        <TextField
          label="Search Pizzas"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          fullWidth
          sx={{
            position: "absolute", // Absolute positioning
            top: "20%", // Center vertically
            right: "650px", // Align to the right side of the page
            transform: "translateY(-50%)", // Adjust to center vertically
            maxWidth: "400px",
            margin: "0", // Remove margin since it's absolute
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {searchTerm && (
                  <IconButton onClick={clearSearch} edge="end">
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </div>

      {/* Pizzas List */}
      {pizzas && pizzas.length < 0 ? (
        <Loader />
      ) : (
        filteredPizzas.map((pizza, index) => (
          <Pizza pizza={pizza} key={index} />
        ))
      )}
    </div>
  );
}

export function Loader() {
  const [open] = useState(true);
  return (
    <div className="loading">
      <Backdrop
        sx={{ color: "black", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="primary" />
      </Backdrop>
    </div>
  );
}
