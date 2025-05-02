import React from 'react';

const AskJavaQuestion = () => {
  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <div className='flex justify-between'>

        <h2 style={styles.heading}>Ask any Java questions here</h2>
        <a href="https://document-to-ai.vercel.app/chat?sourceId=src_a5vF4GsplYmAr8EJni0AA&name=Java%20BCA.pdf">
        <button >Open in new tab</button>
        </a>
        </div>
        <iframe
          title="Java AI Assistant"
          src="https://document-to-ai.vercel.app/chat?sourceId=src_a5vF4GsplYmAr8EJni0AA&name=Java%20BCA.pdf"
          style={styles.iframe}
        ></iframe>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#121212',
    padding: '20px',
  },
  glassCard: {
    backdropFilter: 'blur(12px)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    width: '100%',
    maxWidth: '900px',
  },
  heading: {
    color: '#fff',
    marginBottom: '20px',
  },
  iframe: {
    width: '100%',
    height: '600px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#fff',
  },
};

export default AskJavaQuestion;
