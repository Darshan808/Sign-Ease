import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/Hompage/Hompage";
import RoomPage from "./pages/RoomPage/Roompage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" Component={HomePage} />
        <Route path="/room/:id" Component={RoomPage} />
      </Routes>
    </div>
  );
}

export default App;
