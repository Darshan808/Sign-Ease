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
  const [send, setSend] = useState(true);
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

  // const showText = () => {
  //   for (let i = 0; i < displayText.length; i++) {
  //     setTimeout(() => {
  //       setText((prevText) => [...prevText, displayText[i]]);
  //     }, (i + 1) * 100);
  //   }
  // };

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
        if (text.length == 0) {
          setText((prev) => [...prev, "YOU:", response.data.translation]);
        } else {
          setText((prev) => [...prev, response.data.translation]);
        }
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  };

  const [intervalId, setIntervalId] = useState(null);

  const startSendingRecordings = () => {
    startRecording();
    console.log("Recording Started!");
    timeoutId = setTimeout(() => {
      stopRecording();
      notifyModel();
    }, 4000);
  };

  const deleteClips = () => {
    axios
      .delete("http://localhost:5000/api/deleteClips")
      .then((response) => {
        console.log("Response:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  };
  let i = 1;
  const testingFunc = () => {
    console.log(i);
    setTimeout(() => {
      console.log("stopped");
    }, 4000);
    i += 1;
  };
  const handleMV = async (type) => {
    if (type == "mic") {
      setIsMicOn((prev) => !prev);
    } else if (type == "video") {
      if (!isVideoOn) {
        deleteClips();
        setStream();
        let myintervalId = setInterval(startSendingRecordings, 4000);
        setIntervalId(myintervalId);
      } else {
        setMyStream(null);
        clearInterval(intervalId);
        setIntervalId(null);
        console.log("set send to ", send);
        setClipNum(1);
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
