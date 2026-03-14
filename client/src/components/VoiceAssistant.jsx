import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Stop after one command
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                toast.success('Listening... Speak your destination', {
                    icon: '🎤',
                    duration: 3000,
                });
            };

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log('Voice Command:', transcript);
                
                handleVoiceCommand(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                if (event.error !== 'no-speech') {
                    toast.error(`Voice error: ${event.error}`);
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [navigate]);

    const handleVoiceCommand = (command) => {
        if (command.includes('home')) {
            toast.success('Navigating to Home');
            navigate('/');
        } else if (command.includes('about')) {
            toast.success('Navigating to About');
            navigate('/about');
        } else if (command.includes('product') || command.includes('shop')) {
            toast.success('Navigating to Products');
            navigate('/products');
        } else if (command.includes('contact')) {
            toast.success('Navigating to Contact');
            navigate('/contact');
        } else if (command.includes('cart') || command.includes('bag')) {
            toast.success('Navigating to Cart');
            navigate('/cart');
        } else if (command.includes('order')) {
            toast.success('Navigating to Orders');
            navigate('/my-orders');
        } else if (command.includes('seller')) {
            toast.success('Navigating to Seller Dashboard');
            navigate('/seller');
        } else if (command.includes('login') || command.includes('sign in')) {
            toast.success('Navigating to Login (Triggering Login Modal/Page if applicable)');
            // For now just logging, the trigger for Login is usually global but we can navigate if there's a route, 
            // but login is managed by contextual state `showUserLogin`. We will just show a toast for now if we can't trigger state.
            toast.success("Please click the login button in navbar.");
        } else {
            toast.error(`Unrecognized command: "${command}". Try 'home', 'about', 'products', 'cart'`);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error("Your browser doesn't support speech recognition.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Speech recognition start error:", e);
                // Sometimes it's already started, stop and restart
                recognitionRef.current.stop();
                setTimeout(() => {
                   recognitionRef.current.start();
                }, 100);
            }
        }
    };

    return (
        <button
            onClick={toggleListening}
            className={`fixed bottom-6 left-6 z-50 p-4 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border bg-white ${isListening ? 'bg-red-50 text-red-500 scale-110 shadow-md border-red-200 animate-pulse' : 'text-primary hover:scale-105 border-gray-100'}`}
            title="Voice Navigation (Say 'Home', 'About', 'Cart', etc.)"
            aria-label="Voice Navigation"
        >
            {isListening ? (
                <>
                   {/* Microphone listening icon */}
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" x2="12" y1="19" y2="22"></line>
                        <line x1="8" x2="16" y1="22" y2="22"></line>
                   </svg>
                   <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                </>
            ) : (
                <>
                    {/* Microphone static icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" x2="12" y1="19" y2="22"></line>
                    </svg>
                </>
            )}
        </button>
    );
};

export default VoiceAssistant;
