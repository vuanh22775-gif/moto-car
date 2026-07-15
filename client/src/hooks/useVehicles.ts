import { useVehicles as useVehiclesContext } from '@context/VehicleContext';

export const useVehicles = () => {
  const context = useVehiclesContext();
  return context;
};