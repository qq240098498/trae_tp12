import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/Layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Pets from '@/pages/Pets';
import PetNew from '@/pages/Pets/PetNew';
import PetDetail from '@/pages/Pets/PetDetail';
import PetProfileEdit from '@/pages/Pets/PetProfileEdit';
import RoutesPage from '@/pages/Routes';
import RouteNew from '@/pages/Routes/RouteNew';
import Pricing from '@/pages/Pricing';
import Vehicles from '@/pages/Vehicles';
import VehicleNew from '@/pages/Vehicles/VehicleNew';
import Orders from '@/pages/Orders';
import OrderNew from '@/pages/Orders/OrderNew';
import OrderDetail from '@/pages/Orders/OrderDetail';
import Dispatch from '@/pages/Dispatch';
import Tracking from '@/pages/Tracking';
import Employees from '@/pages/Employees';
import Exceptions from '@/pages/Exceptions';
import ExceptionNew from '@/pages/Exceptions/ExceptionNew';
import ExceptionDetail from '@/pages/Exceptions/ExceptionDetail';
import Insurance from '@/pages/Insurance';
import PolicyDetail from '@/pages/Insurance/PolicyDetail';
import ClaimNew from '@/pages/Insurance/ClaimNew';
import ClaimDetail from '@/pages/Insurance/ClaimDetail';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pets" element={<Pets />} />
          <Route path="pets/new" element={<PetNew />} />
          <Route path="pets/:id" element={<PetDetail />} />
          <Route path="pets/:id/profile/edit" element={<PetProfileEdit />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="routes/new" element={<RouteNew />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="vehicles/new" element={<VehicleNew />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<OrderNew />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="dispatch" element={<Dispatch />} />
          <Route path="employees" element={<Employees />} />
          <Route path="exceptions" element={<Exceptions />} />
          <Route path="exceptions/new" element={<ExceptionNew />} />
          <Route path="exceptions/:id" element={<ExceptionDetail />} />
          <Route path="insurance" element={<Insurance />} />
          <Route path="insurance/policies/:id" element={<PolicyDetail />} />
          <Route path="insurance/claims/new" element={<ClaimNew />} />
          <Route path="insurance/claims/:id" element={<ClaimDetail />} />
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="text-6xl mb-4">🐾</div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
                  <p className="text-gray-500 mb-6">哎呀，页面走失了...</p>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}
