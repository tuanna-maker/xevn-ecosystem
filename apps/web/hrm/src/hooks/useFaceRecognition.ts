import { useState, useCallback, useRef } from 'react';

import * as faceapi from 'face-api.js';

import { useAuth } from '@/contexts/AuthContext';

import { toast } from 'sonner';

import { toErrorMessage } from '@/lib/apiError';

import { deleteFaceData, listFaceData, upsertFaceData } from '@/integrations/hrmApi';



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

const FACE_MATCH_THRESHOLD = 0.6;



function mapFaceRow(row: Record<string, unknown>): FaceData {

  const descriptor = row.face_descriptor;

  return {

    id: String(row.id),

    employee_id: String(row.employee_id),

    company_id: String(row.company_id),

    face_descriptor: Array.isArray(descriptor) ? (descriptor as number[]) : [],

    face_image_url: row.face_image_url ? String(row.face_image_url) : null,

    created_at: String(row.created_at ?? ''),

    updated_at: String(row.updated_at ?? ''),

  };

}



export function useFaceRecognition() {

  const { currentCompanyId: companyId } = useAuth();

  const [modelsLoaded, setModelsLoaded] = useState(false);

  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const [faceDataList, setFaceDataList] = useState<FaceData[]>([]);

  // Use refs to prevent infinite loops - refs don't trigger re-render
  const loadAttemptedRef = useRef(false);
  const loadFailedRef = useRef(false);



  const loadModels = useCallback(async () => {
    // Prevent multiple simultaneous load attempts
    if (loadAttemptedRef.current) return modelsLoaded;
    if (modelsLoaded) return true;
    if (isLoadingModels) return false;

    loadAttemptedRef.current = true;
    setIsLoadingModels(true);

    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      return true;
    } catch (error) {
      console.error('Error loading face recognition models:', error);
      if (!loadFailedRef.current) {
        loadFailedRef.current = true;
        toast.error('Không thể tải mô hình nhận diện khuôn mặt');
      }
      return false;
    } finally {
      setIsLoadingModels(false);
    }
  }, []); // No dependencies - stable reference



  const fetchFaceData = useCallback(async () => {

    if (!companyId) return [];



    try {

      const response = await listFaceData(companyId);

      const mapped = (response.data ?? []).map(mapFaceRow);

      setFaceDataList(mapped);

      return mapped;

    } catch (error) {

      console.error('Error fetching face data:', error);

      return [];

    }

  }, [companyId]);



  const detectFace = useCallback(

    async (

      input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,

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

    [modelsLoaded, loadModels],

  );



  const registerFace = useCallback(

    async (employeeId: string, faceDescriptor: Float32Array, faceImageDataUrl?: string): Promise<boolean> => {

      if (!companyId) {

        toast.error('Không tìm thấy công ty');

        return false;

      }



      try {

        await upsertFaceData({

          company_id: companyId,

          employee_id: employeeId,

          face_descriptor: Array.from(faceDescriptor),

          face_image_url: faceImageDataUrl ?? null,

        });

        await fetchFaceData();

        toast.success('Đã đăng ký khuôn mặt');

        return true;

      } catch (error) {

        console.error('Error registering face:', error);

        toast.error(toErrorMessage(error, 'Lỗi khi đăng ký khuôn mặt'));

        return false;

      }

    },

    [companyId, fetchFaceData],

  );



  const deleteFaceDataForEmployee = useCallback(

    async (employeeId: string): Promise<boolean> => {

      if (!companyId) return false;

      try {

        await deleteFaceData(employeeId, companyId);

        await fetchFaceData();

        toast.success('Đã xóa dữ liệu khuôn mặt');

        return true;

      } catch (error) {

        console.error('Error deleting face data:', error);

        toast.error(toErrorMessage(error, 'Lỗi khi xóa dữ liệu khuôn mặt'));

        return false;

      }

    },

    [companyId, fetchFaceData],

  );



  const matchFace = useCallback(

    async (

      faceDescriptor: Float32Array,

      employees: Array<{ id: string; full_name: string; employee_code: string }>,

    ): Promise<EmployeeFaceMatch | null> => {

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

    [faceDataList, fetchFaceData],

  );



  const hasRegisteredFace = useCallback(

    (employeeId: string): boolean => faceDataList.some((data) => data.employee_id === employeeId),

    [faceDataList],

  );



  return {

    modelsLoaded,

    isLoadingModels,

    loadModels,

    detectFace,

    registerFace,

    deleteFaceData: deleteFaceDataForEmployee,

    matchFace,

    hasRegisteredFace,

    fetchFaceData,

    faceDataList,

    FACE_MATCH_THRESHOLD,

  };

}


