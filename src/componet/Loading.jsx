import React, { useState, useEffect } from 'react';

const Loading = () => {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
const getFormattedTime = (offsetSeconds = 0) => {
  const now = new Date(Date.now() + offsetSeconds * 1000);
  return now.toTimeString().split(' ')[0];
};

const [terminalLines] = useState(() => {
  let timestamp = 10;
  const delays = [3000, 6000, 1000, 3000, 3000, 800, 1200, 4000, 2000, 3000, 9000, 5000, 8000, 3000, 1000, 6000, 3000, 5000, 5000, 5500];

  const texts = [
    'WELCOME TO PIXEL CLASS ...',
    '',
    'INCOMING HTTP REQUEST DETECTED ...',
    '',
    'SERVICE WAKING UP ...',
    '',
    'PLEASE WAIT ...',
    '',
    'PREPARING INSTANCE FOR INITIALIZATION ...',
    '',
    'STARTING THE INSTANCE ...',
    '',
    'ENVIRONMENT VARIABLES INJECTED ...',
    '',
    'FINALIZING STARTUP ...',
    '',
    'OPTIMIZING DEPLOYMENT ...',
    '',
    'OPTIMIZING SERVER ...',
    '',
    'STEADY HANDS. CLEAN LOGS. PIXEL CLASS IS ALMOST READY ...'
  ];

  const types = [
    'name', 'empty', 'log', 'empty', 'log', 'empty', 'log', 'empty',
    'log', 'empty', 'log', 'empty', 'log', 'empty',
    'log', 'empty', 'log', 'empty', 'log', 'empty', 'success'
  ];

  return texts.map((text, i) => {
    const line = {
      text: text ? `${getFormattedTime(timestamp)} ${text}` : '',
      delay: delays[i],
      type: types[i]
    };
    timestamp += delays[i] / 4000; // move forward by delay in seconds
    return line;
  });
});

  useEffect(() => {
    if (currentLineIndex >= terminalLines.length) return;

    const currentLine = terminalLines[currentLineIndex];
    
    if (charIndex < currentLine.text.length) {
      // Type character by character
      const typingSpeed = currentLine.type === 'ascii' ? 20 : 
                         currentLine.type === 'log' ? 30 : 50;
      
      const timer = setTimeout(() => {
        setCurrentText(prev => prev + currentLine.text[charIndex]);
        setCharIndex(prev => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timer);
    } else {
      // Line is complete, add to displayed lines and move to next
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, {
          text: currentText,
          type: currentLine.type
        }]);
        setCurrentText('');
        setCharIndex(0);
        setCurrentLineIndex(prev => prev + 1);
      }, currentLine.delay);

      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, charIndex, currentText, terminalLines]);

  // Start the animation
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setCurrentLineIndex(0);
    }, 2000);

    return () => clearTimeout(startTimer);
  }, []);

  const getLineStyle = (type) => {
    switch (type) {
      case 'log':
        return 'text-gray-300';
      case 'ascii':
        return 'text-green-500 font-bold';
      case 'success':
        return 'text-green-400 font-medium';
      case 'name':
        return 'text-green-600 font-black';
      case 'empty':
        return '';
      default:
        return 'text-green-300';
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex  p-4">
        <div className="p-4 overflow-auto h-full text-left font-mono text-sm md:text-sm lg:text-lg">
          {displayedLines.map((line, index) => (
            <div key={index} className={`${getLineStyle(line.type)} leading-relaxed`}>
              {line.text || '\u00A0'}
            </div>
          ))}
          
          {/* Display current typing line */}
          {currentText && (
            <div className={`${getLineStyle(terminalLines[currentLineIndex]?.type)} leading-relaxed`}>
              {currentText}
              <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse"></span>
            </div>
          )}
          
          {/* Show cursor when not typing */}
          {!currentText && currentLineIndex < terminalLines.length && (
            <span className="inline-block w-2 h-4 bg-green-400 animate-pulse"></span>
          )}
        </div>
    </div>
  );
};

export default Loading;