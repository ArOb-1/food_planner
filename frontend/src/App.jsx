import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import GeneratePlan from './pages/GeneratePlan'
import MyPlans from './pages/MyPlans'
import PlanDetail from './pages/PlanDetail'
import ProtectedRoute from './components/ProtectedRoute'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import { Toaster } from 'react-hot-toast'
import Donate from './pages/Donate'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right"/>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/donate" element={<Donate />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/generate" element={<GeneratePlan />} />
            <Route path="/plans" element={<MyPlans />} />
            <Route path="/plans/:id" element={<PlanDetail />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}