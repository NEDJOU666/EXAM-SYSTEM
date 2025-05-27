import React, { useState } from 'react';

const EditExam = () => {
  const [duration, setDuration] = useState(60); // default 60 minutes
  const [rules, setRules] = useState('No phones. Camera must be on.');
  const [questions, setQuestions] = useState([
    { id: 1, text: 'What is React?', answer: '' },
  ]);

  const handleQuestionChange = (index, key, value) => {
    const updated = [...questions];
    updated[index][key] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: '', answer: '' }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ duration, rules, questions });
    alert('Exam updated successfully!');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Edit Exam</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Timing */}
        <label style={styles.label}>Exam Duration (minutes):</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          style={styles.input}
          required
        />

        {/* Rules */}
        <label style={styles.label}>Exam Rules:</label>
        <textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          style={styles.textarea}
        />

        {/* Questions */}
        <h3 style={styles.subtitle}>Questions</h3>
        {questions.map((q, index) => (
          <div key={q.id} style={styles.questionBlock}>
            <input
              type="text"
              placeholder={`Question ${index + 1}`}
              value={q.text}
              onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Answer"
              value={q.answer}
              onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
              style={styles.input}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addQuestion} style={styles.addButton}>
          + Add Question
        </button>

        {/* Submit */}
        <button type="submit" style={styles.submitButton}>Save Changes</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: '50px auto',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '10px',
    border: '1px solid lightgray',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    color: 'darkblue',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  label: {
    fontWeight: 'bold',
    color: 'darkslategray',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid silver',
  },
  textarea: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid silver',
    resize: 'vertical',
    minHeight: '80px',
  },
  subtitle: {
    marginTop: '20px',
    color: 'teal',
  },
  questionBlock: {
    backgroundColor: '#f0f8ff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid lightblue',
  },
  addButton: {
    backgroundColor: 'steelblue',
    color: 'white',
    padding: '10px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  submitButton: {
    backgroundColor: 'seagreen',
    color: 'white',
    padding: '12px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default EditExam;

