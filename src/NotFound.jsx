import React, { useState, useEffect } from 'react';

const NotFound = () => {
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
    const delays = [2000, 3000, 1000, 2500, 2000, 1000, 3000, 1500, 4000, 6000];

    const texts = [
      'SYSTEM ALERT: PAGE NOT FOUND ...',
      '',
      'ATTEMPTING TO LOCATE RESOURCE ...',
      '',
      'RESOURCE UNAVAILABLE ...',
      '',
      'ERROR CODE: 404 ...',
      '',
      'THE PAGE YOU REQUESTED DOES NOT EXIST ...',
      'RETURNING TO SAFE ZONE ...'
    ];

    const types = [
      'name', 'empty', 'log', 'empty', 'log', 'empty', 'log', 'empty', 'log', 'success'
    ];

    return texts.map((text, i) => {
      const line = {
        text: text ? `${getFormattedTime(timestamp)} ${text}` : '',
        delay: delays[i],
        type: types[i]
      };
      timestamp += delays[i] / 4000;
      return line;
    });
  });

  useEffect(() => {
    if (currentLineIndex >= terminalLines.length) return;

    const currentLine = terminalLines[currentLineIndex];

    if (charIndex < currentLine.text.length) {
      const typingSpeed = currentLine.type === 'log' ? 30 : 50;

      const timer = setTimeout(() => {
        setCurrentText(prev => prev + currentLine.text[charIndex]);
        setCharIndex(prev => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timer);
    } else {
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

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setCurrentLineIndex(0);
    }, 1000);

    return () => clearTimeout(startTimer);
  }, []);

  const getLineStyle = (type) => {
    switch (type) {
      case 'log':
        return 'text-gray-300';
      case 'success':
        return 'text-red-400 font-medium';
      case 'name':
        return 'text-red-600 font-black';
      case 'empty':
        return '';
      default:
        return 'text-red-300';
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-left justify-start p-4">
      <div className="p-4 overflow-auto h-full text-left font-mono text-sm max-w-2xl">
        {displayedLines.map((line, index) => (
          <div key={index} className={`${getLineStyle(line.type)} leading-relaxed`}>
            {line.text || '\u00A0'}
          </div>
        ))}

        {currentText && (
          <div className={`${getLineStyle(terminalLines[currentLineIndex]?.type)} leading-relaxed`}>
            {currentText}
            <span className="inline-block w-2 h-4 bg-red-400 ml-1 animate-pulse"></span>
          </div>
        )}

        {!currentText && currentLineIndex < terminalLines.length && (
          <span className="inline-block w-2 h-4 bg-red-400 animate-pulse"></span>
        )}

        {currentLineIndex >= terminalLines.length && (
          <div className="mt-6">
            <a
              href="/"
              className="inline-block rounded border border-red-400 px-6 py-2 text-red-400 hover:bg-red-400 hover:text-black transition"
            >
              Go Back Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;
