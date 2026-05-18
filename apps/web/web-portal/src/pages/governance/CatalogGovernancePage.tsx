import React from 'react';
import { Navigate } from 'react-router-dom';

/** Chuyển hướng sang Command Center — mục Cài đặt → Duyệt danh mục HRM */
const CatalogGovernancePage: React.FC = () => (
  <Navigate to="/command-center?settings=hrm_catalog_governance" replace />
);

export default CatalogGovernancePage;
