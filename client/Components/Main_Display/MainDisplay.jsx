import "./MainDisplay.css";
import Mic from "../../Assets/microphone-black-shape.png";
import Video from "../../Assets/zoom.png";
import Call from "../../Assets/phone.png";
import Mute_Mic from "../../Assets/mute-microphone.png";
import No_Video from "../../Assets/no-video.png";
import axios from "axios";
import { useState } from "react";
import ReactPlayer from "react-player";
import { useReactMediaRecorder } from "react-media-recorder";
import { useNavigate } from "react-router-dom";

const MainDisplay = ({ isVideoOn, setIsVideoOn, isMicOn, setIsMicOn }) => {
  const [text, setText] = useState([]);
  const [myStream, setMyStream] = useState(null);
  const [clipNum, setClipNum] = useState(1);
  const modelUrl = "http://localhost:5000/api/translate";
  let send = true;
  const navigate = useNavigate();

  const downloadVideo = (blobUrl, fileName) => {
    const a = document.createElement("a");
    a.download = fileName;
    a.href = blobUrl;
    a.classList.add("recorder");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUrl = (blobUrl) => {
    console.log("handling url");
    downloadVideo(blobUrl, `clip${clipNum}`);
    console.log(blobUrl);
  };

  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      video: true,
      audio: false,
      onStop: (blobUrl) => handleUrl(blobUrl),
    });

  const displayStr =
    "Josh: Hello Everyone.SignEase is a game-changer! The seamless real-time translation of handsigns into captions makes communication effortless and inclusive, revolutionizing accessibility for the hearing-impaired.";
  const displayText = displayStr.split(" ");
  const showText = () => {
    for (let i = 0; i < displayText.length; i++) {
      setTimeout(() => {
        setText((prevText) => [...prevText, displayText[i]]);
      }, (i + 1) * 100);
    }
  };

  const setStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    setMyStream(stream);
  };

  let timeoutId = null;
  let st = 1;
  const notifyModel = () => {
    let currClipNum = clipNum;
    setClipNum((prev) => prev + 1);
    axios
      .post(modelUrl, { name: `clip${currClipNum}.mp4` })
      .then((response) => {
        console.log("Response:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  };

  const stopSendingRecordings = () => {
    stopRecording();
    console.log("recording stopped!");
    console.log("send is ", send);
    notifyModel();
    // if (send && st < 10) {
    //   clearTimeout(timeoutId);
    //   console.log("status: ", st);
    //   st += 1;
    //   startSendingRecordings();
    // }
  };

  const startSendingRecordings = () => {
    startRecording();
    console.log("Recording Started!");
    timeoutId = setTimeout(() => {
      stopSendingRecordings();
    }, 4000);
  };

  const handleMV = async (type) => {
    if (type == "mic") {
      isMicOn && showText();
      setIsMicOn((prev) => !prev);
    } else if (type == "video") {
      if (!isVideoOn) {
        send = true;
        startSendingRecordings();
        setStream();
      } else {
        setMyStream(null);
        send = false;
        console.log("set send to ", send);
        st = 10;
        clearTimeout(timeoutId);
        stopRecording();
        await myStream.getTracks().forEach((track) => track.stop());
      }
      setIsVideoOn((prev) => !prev);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="video-content">
      <div className="video-box r-wrapper">
        {isVideoOn ? (
          <>
            <ReactPlayer
              playing
              volume={0}
              height="1000px"
              width="1000px"
              url={myStream}
            />
          </>
        ) : (
          <img src={No_Video} />
        )}
        <video className="recorder" src={mediaBlobUrl} controls muted />
      </div>
      <div className="text-box r-wrapper">
        {text.map((word, index) => (
          <span key={index}>{word}</span>
        ))}
      </div>
      <div className="button-box r-wrapper">
        <img
          src={isMicOn ? Mic : Mute_Mic}
          onClick={handleMV.bind(this, "mic")}
        />
        <img src={Call} onClick={handleMV.bind(this, "call")} />
        <img
          src={isVideoOn ? Video : No_Video}
          onClick={handleMV.bind(this, "video")}
        />
      </div>
    </div>
  );
};

export default MainDisplay;
