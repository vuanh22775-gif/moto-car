import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VehicleProvider } from './context/VehicleContext';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Pages - User
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import BookingHistory from './pages/BookingHistory';

// Pages - Admin
import Admin from './pages/Admin';
import AdminVehicles from './pages/AdminVehicles';
import AdminBookings from './pages/AdminBookings';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import Favorites from './pages/Favorites';
import MyVehicles from './pages/MyVehicles';

function App() {
  return (
    <AuthProvider>
      <VehicleProvider>
        <Router>
          <Routes>
            {/* User routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/booking" element={<PrivateRoute><Booking /></PrivateRoute>} />
              <Route path="/booking-history" element={<PrivateRoute><BookingHistory /></PrivateRoute>} />
              <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
              <Route path="/my-vehicles" element={<PrivateRoute><MyVehicles /></PrivateRoute>} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Admin />} />
              <Route path="vehicles" element={<AdminVehicles />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
          </Routes>
        </Router>
      </VehicleProvider>
    </AuthProvider>
  );
}

export default App;