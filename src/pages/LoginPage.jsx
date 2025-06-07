import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import { Deepgram } from "@deepgram/sdk";

const deepgramApiKey = "b636847ca49a6239478467e603807fa026604c64"; 
// 183d8fe5-af11-4258-a1cf-e3e521c2f35e
function LoginPage() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to handle Deepgram voice input
  const handleVoiceInput = async () => {
    setLoading(true);
    try {
      // Get user audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      let audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const arrayBuffer = await audioBlob.arrayBuffer();

        // Send audio to Deepgram
        const deepgram = new Deepgram(deepgramApiKey);
        const { results } = await deepgram.transcription.preRecorded(
          { buffer: arrayBuffer, mimetype: "audio/wav" },
          { punctuate: true }
        );

        const transcript = results.channels[0].alternatives[0].transcript;

        // Simple parsing (customize as needed)
        // Example: "My name is John, my phone number is 1234567890, my gender is male"
        const nameMatch = transcript.match(/name is (\w+)/i);
        const phoneMatch = transcript.match(/number is (\d+)/i);
        const genderMatch = transcript.match(/gender is (\w+)/i);

        setUsername(nameMatch ? nameMatch[1] : "");
        setPhone(phoneMatch ? phoneMatch[1] : "");
        setGender(genderMatch ? genderMatch[1] : "");

        // If all fields are filled, save to backend and navigate to home
        if (nameMatch && phoneMatch && genderMatch) {
          // Send data to backend
          await fetch("http://localhost:5000/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: nameMatch[1],
              phone: phoneMatch[1],
              gender: genderMatch[1],
            }),
          });
          setTimeout(() => navigate("/"), 1000);
        }
        setLoading(false);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000); 
    } catch (error) {
      alert("Error accessing microphone or Deepgram API.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>AI Voice Login for the Visually Impaired</h2>
      <button onClick={handleVoiceInput} disabled={loading}>
        {loading ? "Listening..." : "Speak to Login / Create Account"}
      </button>
      <div className="status-text">
        <p>Username: <span>{username || <span className="placeholder">Not detected</span>}</span></p>
        <p>Phone Number: <span>{phone || <span className="placeholder">Not detected</span>}</span></p>
        <p>Gender: <span>{gender || <span className="placeholder">Not detected</span>}</span></p>
      </div>
    </div>
  );
}

export default LoginPage;