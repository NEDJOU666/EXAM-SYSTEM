'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

const exams = [
  { id: 1, title: 'Java Programming', date: '2025-06-01' },
  { id: 2, title: 'Civics and Ethics', date: '2025-05-17' },
  { id: 3, title: 'OODAI', date: '2025-05-10' },
  { id: 4, title: 'Computational Maths', date: '2025-06-10' },
];

const performance = [
  { name: 'Jan', score: 60 },
  { name: 'Feb', score: 70 },
  { name: 'Mar', score: 80 },
  { name: 'Apr', score: 85 },
  { name: 'May', score: 90 },
];

function getStatus(dateString) {
  const today = new Date();
  const examDate = new Date(dateString);
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);

  if (examDate > today) return 'Not Started';
  if (examDate < today) return 'Completed';
  return 'In Progress';
}

function getNextExam(exams) {
  const today = new Date();
  return exams
    .map((exam) => ({ ...exam, dateObj: new Date(exam.date) }))
    .filter((e) => e.dateObj >= today)
    .sort((a, b) => a.dateObj - b.dateObj)[0];
}

function getAverageScore(data) {
  const total = data.reduce((sum, entry) => sum + entry.score, 0);
  return (total / data.length).toFixed(1);
}

const statusColors = {
  'Not Started': 'text-red-500',
  'In Progress': 'text-orange-500',
  'Completed': 'text-green-500',
};

export default function StudentDashboard() {
  const [nextExam, setNextExam] = useState(null);

  useEffect(() => {
    setNextExam(getNextExam(exams));
  }, []);

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-center mb-8 text-black text-3xl">🎓 Welcome to Your Dashboard</h1>

      <div className="text-center mt-10">
        <Link href="/student/profile" className="mx-6 font-bold text-blue-500 underline">👤 Profile</Link>
        <Link href="/student/results" className="mx-6 font-bold text-blue-500 underline">📈 My Results</Link>
        <Link href="/help" className="mx-6 font-bold text-blue-500 underline">Help Center❓</Link>
        <Link href="/Take Exam" className="mx-6 font-bold text-blue-500 underline">Take Exam</Link>
      </div>

      <div className="flex justify-around mb-8 bg-white p-5 rounded-xl shadow-lg text-black">
        <div className="text-center">
          <h3>Total Exams</h3>
          <p>{exams.length}</p>
        </div>
        <div className="text-center">
          <h3>Average Score</h3>
          <p>{getAverageScore(performance)}%</p>
        </div>
        <div className="text-center">
          <h3>Passed</h3>
          <p>3 / 3</p>
        </div>
      </div>

      {nextExam && (
        <div className="bg-sky-400 p-5 rounded-xl mb-8 text-center text-white">
          <h2>⏳ Your Next Exam: {nextExam.title}</h2>
          <p>Scheduled for <strong>{nextExam.date}</strong></p>
        </div>
      )}

      <div className="bg-white p-5 rounded-xl shadow-lg mb-10">
        <h3 className="text-center text-green-600 font-bold">📊 Performance Evolution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="blue" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-center mb-5 text-black">📅 Upcoming & Completed Exams</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map((exam) => {
          const status = getStatus(exam.date);
          return (
            <div key={exam.id} className="bg-white p-5 rounded-xl shadow-lg">
              <h3 className="text-black font-semibold">{exam.title}</h3>
              <p className="text-black"><strong>Date:</strong> {exam.date}</p>
              <p className="text-black">
                <strong>Status:</strong>{' '}
                <span className={`${statusColors[status]} font-bold`}>
                  {status}
                </span>
              </p>
              <Link href={`/student/exams/${exam.id}`} className="mt-3 inline-block text-blue-500 underline font-bold">
                View Exam Info →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
