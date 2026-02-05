import { useQuery } from '@tanstack/react-query';

import { ONE_HOUR_MS } from '@/shared/constant';

import { getCategories, getEquipmentList } from '../api/exercises.api';

export const useCategories = () =>
  useQuery({
    queryKey: ['exercises', 'categories'],
    queryFn: getCategories,
    staleTime: ONE_HOUR_MS,
  });

export const useEquipmentList = () =>
  useQuery({
    queryKey: ['exercises', 'equipmentList'],
    queryFn: getEquipmentList,
    staleTime: ONE_HOUR_MS,
  });
