import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomPage';
import AuthPage from './components/AuthPage';
import FinalLinkPage from './components/FinalLinkPage';
import AnalyticPage from './components/AnalyticPage';


import QuizinfoComponent from './components/QuizinfoComponent';




const App = () => {

  return (
    <Router>
      {/* In your main component (e.g., App), wrap your application with a provider that will provide the state and functions to its descendants. */}
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/quiz/:quizId" element={<QuizinfoComponent/>} />
          <Route path="/final-page/:quizId" element={<FinalLinkPage />} />
          <Route path="/analytic-page" element={<AnalyticPage />} />



          {/* Other components */}
        </Routes>
    </Router>
  );
};

export default App;
