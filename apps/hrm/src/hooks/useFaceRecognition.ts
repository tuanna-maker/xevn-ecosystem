import { useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FaceData {
  id: string;
  employee_id: string;
  company_id: string;
  face_descriptor: number[];
  face_image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface EmployeeFaceMatch {
  employee_id: string;
  employee_name: string;
  employee_code: string;
  distance: number;
  confidence: number;
}

const MODEL_URL = '/models';
const FACE_MATCH_THRESHOLD = 0.6; // Lower is stricter

export function useFaceRecognition() {
  const { currentCompanyId: companyId } = useAuth();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [faceDataList, setFaceDataList] = useState<FaceData[]>([]);

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    if (modelsLoaded || isLoadingModels) return modelsLoaded;

    setIsLoadingModels(true);
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      console.log('Face recognition models loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading face recognition models:', error);
      toast.error('Không thể tải mô hình nhận diện khuôn mặt');
      return false;
    } finally {
      setIsLoadingModels(false);
    }
  }, [modelsLoaded, isLoadingModels]);

  // Fetch all face data for the company
  const fetchFaceData = useCallback(async () => {
    if (!companyId) return [];

    try {
      const { data, error } = await supabase
        .from('employee_face_data')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;

      const faceData = (data || []).map((item) => ({
        ...item,
        face_descriptor: item.face_descriptor as number[],
      }));
      
      setFaceDataList(faceData);
      return faceData;
    } catch (error) {
      console.error('Error fetching face data:', error);
      return [];
    }
  }, [companyId]);

  // Detect face from video/image element
  const detectFace = useCallback(
    async (
      input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
    ): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>> | null> => {
      if (!modelsLoaded) {
        const loaded = await loadModels();
        if (!loaded) return null;
      }

      const detection = await faceapi
        .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      return detection || null;
    },
    [modelsLoaded, loadModels]
  );

  // Register a new face for an employee
  const registerFace = useCallback(
    async (
      employeeId: string,
      faceDescriptor: Float32Array,
      faceImageDataUrl?: string
    ): Promise<boolean> => {
      if (!companyId) {
        toast.error('Không tìm thấy công ty');
        return false;
      }

      try {
        const descriptorArray = Array.from(faceDescriptor);

        const { error } = await supabase.from('employee_face_data').upsert(
          {
            employee_id: employeeId,
            company_id: companyId,
            face_descriptor: descriptorArray,
            face_image_url: faceImageDataUrl || null,
          },
          {
            onConflict: 'employee_id',
          }
        );

        if (error) throw error;

        await fetchFaceData();
        toast.success('Đã đăng ký khuôn mặt thành công!');
        return true;
      } catch (error) {
        console.error('Error registering face:', error);
        toast.error('Lỗi khi đăng ký khuôn mặt');
        return false;
      }
    },
    [companyId, fetchFaceData]
  );

  // Delete face data for an employee
  const deleteFaceData = useCallback(
    async (employeeId: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from('employee_face_data')
          .delete()
          .eq('employee_id', employeeId);

        if (error) throw error;

        await fetchFaceData();
        toast.success('Đã xóa dữ liệu khuôn mặt');
        return true;
      } catch (error) {
        console.error('Error deleting face data:', error);
        toast.error('Lỗi khi xóa dữ liệu khuôn mặt');
        return false;
      }
    },
    [fetchFaceData]
  );

  // Match a face descriptor against stored employee faces
  const matchFace = useCallback(
    async (
      faceDescriptor: Float32Array,
      employees: Array<{ id: string; full_name: string; employee_code: string }>
    ): Promise<EmployeeFaceMatch | null> => {
      // Ensure we have face data
      let faceData = faceDataList;
      if (faceData.length === 0) {
        faceData = await fetchFaceData();
      }

      if (faceData.length === 0) {
        return null;
      }

      let bestMatch: EmployeeFaceMatch | null = null;
      let minDistance = Infinity;

      for (const data of faceData) {
        const storedDescriptor = new Float32Array(data.face_descriptor);
        const distance = faceapi.euclideanDistance(faceDescriptor, storedDescriptor);

        if (distance < minDistance && distance < FACE_MATCH_THRESHOLD) {
          minDistance = distance;
          const employee = employees.find((e) => e.id === data.employee_id);
          if (employee) {
            bestMatch = {
              employee_id: employee.id,
              employee_name: employee.full_name,
              employee_code: employee.employee_code,
              distance,
              confidence: Math.round((1 - distance) * 100),
            };
          }
        }
      }

      return bestMatch;
    },
    [faceDataList, fetchFaceData]
  );

  // Check if an employee has registered face data
  const hasRegisteredFace = useCallback(
    (employeeId: string): boolean => {
      return faceDataList.some((data) => data.employee_id === employeeId);
    },
    [faceDataList]
  );

  return {
    modelsLoaded,
    isLoadingModels,
    loadModels,
    detectFace,
    registerFace,
    deleteFaceData,
    matchFace,
    hasRegisteredFace,
    fetchFaceData,
    faceDataList,
    FACE_MATCH_THRESHOLD,
  };
}
