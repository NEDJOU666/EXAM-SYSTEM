import React from 'react';

const ExamInstruction = () => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Exam Instructions</h2>
      <ul style={styles.list}>
        <li>Ensure you have a stable internet connection before starting the exam.</li>
        <li>Each question is timed. Once the time runs out, it will automatically move to the next question.</li>
        <li>Do not refresh or close the browser during the exam. Doing so may result in disqualification.</li>
        <li>You cannot return to a previous question once you proceed to the next one.</li>
        <li>Keep your camera and microphone on (if required) throughout the exam session.</li>
        <li>No external help, books, or digital devices areallowed during the exam.</li>
        <li>Click "Start Exam" when you are ready. The timer will begin immediately.</li>
        <li>Once you submit, your answers will be final. Double-check before clicking "Submit".</li>
      </ul>
      <button style={styles.button}>Start Exam</button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: '60px auto',
    padding: '40px',
    backgroundColor: 'white',
    border: '1px solid lightgray',
    borderRadius: '10px',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: 'darkblue',
    marginBottom: '25px',
  },
  list: {
    lineHeight: '1.8',
    fontSize: '16px',
    color: 'black',
    paddingLeft: '20px',
    marginBottom: '30px',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '14px',
    backgroundColor: 'forestgreen',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default ExamInstruction;
