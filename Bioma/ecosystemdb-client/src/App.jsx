import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import PublicLayout from './components/PublicLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Organisms from './pages/Organisms';
import Reserves from './pages/Reserves';
import Tags from './pages/Tags';
import Users from './pages/Users';

// Public Pages
import Home from './pages/public/Home';
import Encyclopedia from './pages/public/Encyclopedia';
import SpeciesDetail from './pages/public/SpeciesDetail';
import PublicReserves from './pages/public/PublicReserves';
import PublicSightings from './pages/public/PublicSightings';
import TaxonomyTree from './pages/public/TaxonomyTree';

// Simple Auth Guard
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('bioma_admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="encyclopedia" element={<Encyclopedia />} />
          <Route path="encyclopedia/:id" element={<SpeciesDetail />} />
          <Route path="tree" element={<TaxonomyTree />} />
          <Route path="reserves" element={<PublicReserves />} />
          <Route path="sightings" element={<PublicSightings />} />
        </Route>

        {/* Admin Auth */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="organisms" element={<Organisms />} />
          <Route path="reserves" element={<Reserves />} />
          <Route path="tags" element={<Tags />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
