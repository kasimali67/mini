import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BiometricAuth = ({ onAuthSuccess, authType = 'login' }) => {
  const [authMethod, setAuthMethod] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState('');
  const [supportedMethods, setSupportedMethods] = useState([]);
  const [enrolledBiometrics, setEnrolledBiometrics] = useState([]);

  useEffect(() => {
    checkBiometricSupport();
    fetchEnrolledBiometrics();
  }, []);

  const checkBiometricSupport = async () => {
    const methods = [];
    
    // Check for WebAuthn support (includes fingerprint, face recognition)
    if (window.PublicKeyCredential) {
      methods.push('webauthn');
    }
    
    // Check for camera access (face recognition)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      methods.push('camera');
    } catch (error) {
      console.log('Camera not available');
    }
    
    // Check for microphone (voice recognition)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      methods.push('voice');
    }
    
    setSupportedMethods(methods);
  };

  const fetchEnrolledBiometrics = async () => {
    try {
      const response = await axios.get('/api/auth/biometrics/enrolled', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEnrolledBiometrics(response.data);
    } catch (error) {
      console.error('Error fetching enrolled biometrics:', error);
    }
  };

  const handleWebAuthnAuth = async () => {
    setIsAuthenticating(true);
    setAuthStatus('Initializing biometric authentication...');

    try {
      // Get authentication challenge from server
      const challengeResponse = await axios.post('/api/auth/webauthn/challenge', {
        authType: authType
      });

      const { challenge, allowCredentials } = challengeResponse.data;

      setAuthStatus('Please use your biometric sensor...');

      // Create WebAuthn credentials
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(challenge),
          allowCredentials: allowCredentials.map(cred => ({
            ...cred,
            id: new Uint8Array(cred.id)
          })),
          userVerification: 'required',
          timeout: 60000
        }
      });

      // Send credential to server for verification
      const verifyResponse = await axios.post('/api/auth/webauthn/verify', {
        credential: {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          response: {
            authenticatorData: Array.from(new Uint8Array(credential.response.authenticatorData)),
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
            signature: Array.from(new Uint8Array(credential.response.signature)),
            userHandle: credential.response.userHandle ? Array.from(new Uint8Array(credential.response.userHandle)) : null
          },
          type: credential.type
        },
        authType: authType
      });

      if (verifyResponse.data.success) {
        setAuthStatus('Authentication successful!');
        onAuthSuccess(verifyResponse.data);
      } else {
        setAuthStatus('Authentication failed. Please try again.');
      }

    } catch (error) {
      console.error('WebAuthn authentication error:', error);
      setAuthStatus('Authentication failed. Please try again.');
    }

    setIsAuthenticating(false);
  };

  const handleFaceRecognition = async () => {
    setIsAuthenticating(true);
    setAuthStatus('Starting face recognition...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }
      });

      // Create video element for face capture
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      setAuthStatus('Please look at the camera...');

      // Capture face after 3 seconds
      setTimeout(async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Convert to base64
        const faceData = canvas.toDataURL('image/jpeg', 0.8);

        // Stop camera
        stream.getTracks().forEach(track => track.stop());

        // Send face data to server for recognition
        const response = await axios.post('/api/auth/face/verify', {
          faceData: faceData,
          authType: authType
        });

        if (response.data.success) {
          setAuthStatus('Face recognition successful!');
          onAuthSuccess(response.data);
        } else {
          setAuthStatus('Face not recognized. Please try again.');
        }

        setIsAuthenticating(false);
      }, 3000);

    } catch (error) {
      console.error('Face recognition error:', error);
      setAuthStatus('Face recognition failed. Please try again.');
      setIsAuthenticating(false);
    }
  };

  const handleVoiceRecognition = async () => {
    setIsAuthenticating(true);
    setAuthStatus('Starting voice recognition...');

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setAuthStatus('Please say the passphrase shown below...');

      // Get voice challenge from server
      const challengeResponse = await axios.get('/api/auth/voice/challenge');
      const passphrase = challengeResponse.data.passphrase;

      setAuthStatus(`Please say: "${passphrase}"`);

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        
        // Send voice data to server for verification
        const response = await axios.post('/api/auth/voice/verify', {
          transcript: transcript,
          passphrase: passphrase,
          authType: authType
        });

        if (response.data.success) {
          setAuthStatus('Voice recognition successful!');
          onAuthSuccess(response.data);
        } else {
          setAuthStatus('Voice not recognized. Please try again.');
        }

        setIsAuthenticating(false);
      };

      recognition.onerror = () => {
        setAuthStatus('Voice recognition failed. Please try again.');
        setIsAuthenticating(false);
      };

      recognition.start();

    } catch (error) {
      console.error('Voice recognition error:', error);
      setAuthStatus('Voice recognition failed. Please try again.');
      setIsAuthenticating(false);
    }
  };

  const handleBiometricAuth = () => {
    switch (authMethod) {
      case 'webauthn':
        handleWebAuthnAuth();
        break;
      case 'face':
        handleFaceRecognition();
        break;
      case 'voice':
        handleVoiceRecognition();
        break;
      default:
        break;
    }
  };

  return (
    
      
        🔐 Biometric Authentication
        Choose your preferred biometric method
      

      
        {supportedMethods.includes('webauthn') && (
           setAuthMethod('webauthn')}
          >
            👆
            
              Fingerprint / Face ID
              Use your device's built-in biometric sensor
            
            {enrolledBiometrics.includes('webauthn') && (
              ✓ Enrolled
            )}
          
        )}

        {supportedMethods.includes('camera') && (
           setAuthMethod('face')}
          >
            📷
            
              Face Recognition
              Authenticate using facial recognition
            
            {enrolledBiometrics.includes('face') && (
              ✓ Enrolled
            )}
          
        )}

        {supportedMethods.includes('voice') && (
           setAuthMethod('voice')}
          >
            🎤
            
              Voice Recognition
              Authenticate using voice verification
            
            {enrolledBiometrics.includes('voice') && (
              ✓ Enrolled
            )}
          
        )}
      

      {authStatus && (
        
          {authStatus}
          {isAuthenticating && }
        
      )}

      
        
          {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
        
        
        
          Use Password Instead
        
      

      
        
          🔒
          Your biometric data is encrypted and stored securely
        
        
        
          🛡️
          Biometric authentication adds an extra layer of security
        
        
        
          ⚡
          Faster and more convenient than traditional passwords
        
      
    
  );
};

export default BiometricAuth;
