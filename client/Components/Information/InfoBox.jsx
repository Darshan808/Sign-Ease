import "./InfoBox.css";
import Mic from "../../Assets/microphone.png";
import Video from "../../Assets/video.png";
import Send from "../../Assets/send.png";
import Avatar from "../../Assets/Ellipse 10.png";
import Mute_Mic from "../../Assets/mute.png";
import No_Video from "../../Assets/no-video-h.png";
import { useState } from "react";

const InfoBox = ({ isVideoOn, setIsVideoOn, isMicOn, setIsMicOn }) => {
  const [allChats, setAllChats] = useState(["Hello Everyone!"]);
  const [msg, setMsg] = useState("");
  const handleSumbit = (e) => {
    e.preventDefault();
    setAllChats((prev) => [...prev, msg]);
    setMsg("");
  };
  return (
    <div className="info-content">
      <div className="i-participants r-wrapper">
        <span className="i-title">Participants</span>
        <hr />
        <div className="all-participants">
          <div className="s-participant">
            <div className="p-iname">
              <img src={Avatar} />
              <span>You</span>
            </div>
            <div className="i-icons">
              <img src={isMicOn ? Mic : Mute_Mic} />
              <img src={isVideoOn ? Video : No_Video} />
            </div>
          </div>
        </div>
      </div>
      <div className="i-chats r-wrapper">
        <span className="i-title">Chats</span>
        <hr />
        <div className="chat-box">
          <img src={Avatar} />
          <div className="chats">
            {allChats.map((chat, index) => (
              <span key={index}>{chat}</span>
            ))}
          </div>
        </div>
        <div className="send-chat">
          <form onSubmit={handleSumbit}>
            <input
              type="text"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type something here..."
            ></input>
          </form>
          <img src={Send} onClick={handleSumbit} />
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
