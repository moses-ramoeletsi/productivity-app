import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
       <Router>
         <Toaster
           position="top-right"
           toastOptions={{
             duration: 3000,
             style: {
               background: '#363636',
               color: '#fff',
             },
             success: {
               duration: 3000,
               iconTheme: {
                 primary: '#10b981',
                 secondary: '#fff',
               },
             },
             error: {
               duration: 4000,
               iconTheme: {
                 primary: '#ef4444',
                 secondary: '#fff',
               },
             },
           }}
         />
         <Routes>
           <Route path="/" element={<Navigate to="/login" replace />} />
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
           <Route
             path="/dashboard"
             element={
               <ProtectedRoute>
                 <Dashboard />
               </ProtectedRoute>
             }
           />
         </Routes>
       </Router>
  );
}

export default App
