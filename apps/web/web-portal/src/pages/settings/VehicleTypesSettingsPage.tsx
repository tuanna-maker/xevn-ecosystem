import React, { useEffect, useMemo, useState } from 'react';
import { Truck, Plus, Edit2, Trash2, X, Save, Fuel, Weight } from 'lucide-react';
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  Column,
} from '../../components/common';
import { ApiLoadBanner } from '../../components/common/ApiLoadBanner';
import { AutoResizeTextarea } from '../command-center/settings-form-pattern';
import { mockVehicleTypes, VehicleType } from '../../data/mockData';
import { useCompanyFilterOptions } from '../../hooks/useCompanyFilterOptions';
import {
  AssetRegistryApiError,
  AssetRegistryAsset,
  createRegistryAsset,
  getRegistryAsset,
  listRegistryAssets,
  RegistryRequestContext,
  toCanonicalModuleAlias,
  updateRegistryAsset,
} from '../../integrations/assetRegistryApi';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { resolveIdentityScope, ScopeContextError } from '../../integrations/identityScope';
import { allowMockFallback, API_LOAD_FAILED_MESSAGE } from '../../utils/mockPolicy';

const VEHICLE_REGISTRY_MODULE = 'fleet';

const VehicleTypesSettingsPage: React.FC = () => {
  const { selectedCompany } = useGlobalFilter();
  const { companies } = useCompanyFilterOptions();
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [usingMockFallback, setUsingMockFallback] = useState(false);
  const [scopeErrorMessage, setScopeErrorMessage] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<Partial<Record<'code' | 'name', string>>>({});
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'truck' as VehicleType['category'],
    description: '',
    payloadCapacity: 0,
    fuelConsumptionNorm: 0,
    fuelType: 'diesel' as VehicleType['fuelType'],
    requiredLicense: 'B2' as VehicleType['requiredLicense'],
    maintenanceIntervalKm: 10000,
    applicableCompanies: ['all'] as string[],
  });

  const categoryLabels: Record<VehicleType['category'], string> = {
    container: 'Container/Đầu kéo',
    truck: 'Xe tải',
    refrigerated: 'Xe lạnh',
    bus: 'Xe khách',
    van: 'Xe Van/Shipper',
    pickup: 'Xe bán tải',
    special: 'Xe đặc biệt',
  };

  const categoryColors: Record<VehicleType['category'], string> = {
    container: 'bg-blue-100 text-blue-700',
    truck: 'bg-emerald-100 text-emerald-700',
    refrigerated: 'bg-cyan-100 text-cyan-700',
    bus: 'bg-amber-100 text-amber-700',
    van: 'bg-purple-100 text-purple-700',
    pickup: 'bg-teal-100 text-teal-700',
    special: 'bg-rose-100 text-rose-700',
  };

  const mapRegistryAssetToVehicleType = (asset: AssetRegistryAsset): VehicleType => {
    const metadata = asset.metadata ?? {};
    const typedCategory = metadata.category;
    const category = (
      typedCategory === 'container' ||
      typedCategory === 'truck' ||
      typedCategory === 'refrigerated' ||
      typedCategory === 'bus' ||
      typedCategory === 'van' ||
      typedCategory === 'pickup' ||
      typedCategory === 'special'
    )
      ? typedCategory
      : 'truck';
    const typedFuelType = metadata.fuelType;
    const fuelType = (
      typedFuelType === 'diesel' ||
      typedFuelType === 'gasoline' ||
      typedFuelType === 'electric' ||
      typedFuelType === 'hybrid'
    )
      ? typedFuelType
      : 'diesel';
    const typedLicense = metadata.requiredLicense;
    const requiredLicense = (
      typedLicense === 'B2' ||
      typedLicense === 'C' ||
      typedLicense === 'D' ||
      typedLicense === 'E' ||
      typedLicense === 'FC'
    )
      ? typedLicense
      : 'B2';
    const companies = metadata.applicableCompanies;
    const applicableCompanies = Array.isArray(companies) && companies.length > 0
      ? companies.filter((v): v is string => typeof v === 'string')
      : ['all'];

    return {
      id: asset.assetId,
      code: asset.assetCode,
      name: asset.assetName,
      category,
      description: typeof metadata.description === 'string' ? metadata.description : '',
      payloadCapacity: typeof metadata.payloadCapacity === 'number' ? metadata.payloadCapacity : 0,
      fuelConsumptionNorm: typeof metadata.fuelConsumptionNorm === 'number' ? metadata.fuelConsumptionNorm : 0,
      fuelType,
      requiredLicense,
      maintenanceIntervalKm: typeof metadata.maintenanceIntervalKm === 'number' ? metadata.maintenanceIntervalKm : 10000,
      applicableCompanies,
      status: asset.status === 'active' ? 'active' : 'inactive',
    };
  };

  const scopeResolution = useMemo(() => {
    try {
      const scope = resolveIdentityScope(selectedCompany?.id ?? null);
      return { scope, error: null as string | null };
    } catch (error) {
      return {
        scope: null,
        error:
          error instanceof ScopeContextError
            ? `${error.message} [${error.code}]`
            : 'Không thể xác định phạm vi tenant/company từ identity context [SCOPE_RESOLVE_FAILED]',
      };
    }
  }, [selectedCompany?.id]);

  useEffect(() => {
    setScopeErrorMessage(scopeResolution.error);
  }, [scopeResolution.error]);

  const registryContext: RegistryRequestContext | null = useMemo(() => {
    if (!scopeResolution.scope) {
      return null;
    }
    return {
      moduleCode: VEHICLE_REGISTRY_MODULE,
      scope: scopeResolution.scope,
    };
  }, [scopeResolution.scope]);

  const buildRegistryPayload = () => ({
    tenantId: registryContext?.scope.tenantId ?? '',
    companyId: registryContext?.scope.companyId ?? '',
    assetCode: formData.code.trim(),
    assetName: formData.name.trim(),
    assetType: 'vehicle_type',
    ownerModule: toCanonicalModuleAlias(VEHICLE_REGISTRY_MODULE),
    status: 'active' as const,
    metadata: {
      category: formData.category,
      description: formData.description,
      payloadCapacity: formData.payloadCapacity,
      fuelConsumptionNorm: formData.fuelConsumptionNorm,
      fuelType: formData.fuelType,
      requiredLicense: formData.requiredLicense,
      maintenanceIntervalKm: formData.maintenanceIntervalKm,
      applicableCompanies: formData.applicableCompanies,
    },
  });

  const toUserError = (error: unknown, fallback: string) => {
    if (error instanceof AssetRegistryApiError) {
      return `${fallback}: ${error.message}`;
    }
    return fallback;
  };

  const mapConflictFields = (details: unknown): string[] => {
    if (!details || typeof details !== 'object') {
      return [];
    }
    const detailsRecord = details as Record<string, unknown>;
    const conflictFieldsRaw = detailsRecord.conflictFields ?? detailsRecord.conflict_fields;
    if (!Array.isArray(conflictFieldsRaw)) {
      return [];
    }
    return conflictFieldsRaw.filter((field): field is string => typeof field === 'string');
  };

  const mapConflictScope = (details: unknown): { tenantId: string; companyId: string } | null => {
    if (!details || typeof details !== 'object') {
      return null;
    }
    const detailsRecord = details as Record<string, unknown>;
    const rawScope = detailsRecord.scope;
    if (!rawScope || typeof rawScope !== 'object') {
      return null;
    }
    const scopeRecord = rawScope as Record<string, unknown>;
    const tenantId = typeof scopeRecord.tenantId === 'string' ? scopeRecord.tenantId : '';
    const companyId = typeof scopeRecord.companyId === 'string' ? scopeRecord.companyId : '';
    if (!tenantId || !companyId) {
      return null;
    }
    return { tenantId, companyId };
  };

  const loadVehicleTypes = async () => {
    if (!registryContext) {
      setVehicleTypes(allowMockFallback() ? mockVehicleTypes : []);
      setLoadFailed(!allowMockFallback());
      setUsingMockFallback(false);
      setErrorMessage('Thiếu scope identity (tenant/company) khi tải Asset Registry.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setLoadFailed(false);
    setUsingMockFallback(false);
    try {
      const assets = await listRegistryAssets(registryContext);
      const vehicleAssets = assets.filter((asset) => asset.assetType === 'vehicle_type');
      setVehicleTypes(vehicleAssets.map(mapRegistryAssetToVehicleType));
    } catch (error) {
      setLoadFailed(true);
      if (allowMockFallback()) {
        setVehicleTypes(mockVehicleTypes);
        setUsingMockFallback(true);
        setErrorMessage(
          `${toUserError(error, 'Không thể đồng bộ danh mục từ Asset Registry')}. Hiển thị tạm dữ liệu mẫu (VITE_ALLOW_MOCK_FALLBACK).`,
        );
      } else {
        setVehicleTypes([]);
        setErrorMessage(toUserError(error, 'Không thể đồng bộ danh mục từ Asset Registry'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadVehicleTypes();
  }, [registryContext]);

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      category: 'truck',
      description: '',
      payloadCapacity: 0,
      fuelConsumptionNorm: 0,
      fuelType: 'diesel',
      requiredLicense: 'B2',
      maintenanceIntervalKm: 10000,
      applicableCompanies: ['all'],
    });
    setEditingVehicleType(null);
    setFormFieldErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (vehicleType: VehicleType) => {
    setEditingVehicleType(vehicleType);
    if (!registryContext) {
      setErrorMessage('Không thể tải chi tiết vì thiếu scope identity (tenant/company).');
      setIsModalOpen(true);
      return;
    }
    setLoadingMessage('Đang tải chi tiết asset...');
    void getRegistryAsset(vehicleType.id, registryContext)
      .then((asset) => {
        const mapped = mapRegistryAssetToVehicleType(asset);
        setFormData({
          code: mapped.code,
          name: mapped.name,
          category: mapped.category,
          description: mapped.description,
          payloadCapacity: mapped.payloadCapacity,
          fuelConsumptionNorm: mapped.fuelConsumptionNorm,
          fuelType: mapped.fuelType,
          requiredLicense: mapped.requiredLicense,
          maintenanceIntervalKm: mapped.maintenanceIntervalKm,
          applicableCompanies: mapped.applicableCompanies,
        });
      })
      .catch(() => {
        setFormData({
          code: vehicleType.code,
          name: vehicleType.name,
          category: vehicleType.category,
          description: vehicleType.description,
          payloadCapacity: vehicleType.payloadCapacity,
          fuelConsumptionNorm: vehicleType.fuelConsumptionNorm,
          fuelType: vehicleType.fuelType,
          requiredLicense: vehicleType.requiredLicense,
          maintenanceIntervalKm: vehicleType.maintenanceIntervalKm,
          applicableCompanies: vehicleType.applicableCompanies,
        });
      })
      .finally(() => {
        setLoadingMessage(null);
        setIsModalOpen(true);
      });
  };

  const handleSave = async () => {
    if (!registryContext) {
      setErrorMessage('Không thể lưu vì thiếu scope identity (tenant/company).');
      return;
    }
    if (!formData.code.trim() || !formData.name.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ mã loại và tên loại phương tiện.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setFormFieldErrors({});
    try {
      if (editingVehicleType) {
        const updatedAsset = await updateRegistryAsset(editingVehicleType.id, buildRegistryPayload(), registryContext);
        const updatedVehicleType = mapRegistryAssetToVehicleType(updatedAsset);
        setVehicleTypes((prev) => prev.map((vt) => (vt.id === editingVehicleType.id ? updatedVehicleType : vt)));
      } else {
        const createdAsset = await createRegistryAsset(buildRegistryPayload(), registryContext);
        const createdVehicleType = mapRegistryAssetToVehicleType(createdAsset);
        setVehicleTypes((prev) => [createdVehicleType, ...prev]);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      if (error instanceof AssetRegistryApiError && error.code === 'ASSET-REG-409') {
        const conflictFields = mapConflictFields(error.details);
        const conflictScope = mapConflictScope(error.details);
        const fieldLabelMap: Record<string, string> = {
          asset_code: 'Mã loại xe',
          assetCode: 'Mã loại xe',
          vin: 'VIN',
          chassis_number: 'Số khung',
          chassisNo: 'Số khung',
        };
        const normalizedFields = conflictFields.map((field) => fieldLabelMap[field] ?? field);
        if (conflictFields.includes('asset_code') || conflictFields.includes('assetCode')) {
          setFormFieldErrors({ code: 'Mã loại xe đã tồn tại trong phạm vi công ty đang chọn.' });
        }
        const scopeSuffix = conflictScope
          ? ` (tenant: ${conflictScope.tenantId}, company: ${conflictScope.companyId})`
          : '';
        if (normalizedFields.length > 0) {
          setErrorMessage(
            `Trùng định danh tài sản trong cùng phạm vi tenant + company${scopeSuffix}. Trường bị trùng: ${normalizedFields.join(', ')}.`
          );
        } else {
          setErrorMessage(`Trùng định danh tài sản trong cùng phạm vi tenant + company${scopeSuffix}.`);
        }
      } else {
        setErrorMessage(toUserError(error, 'Không thể lưu loại phương tiện'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (_id: string) => {
    setErrorMessage('Wave 1 chỉ hỗ trợ tạo/cập nhật danh mục qua Asset Registry. Chức năng xóa sẽ mở ở wave sau.');
    void _id;
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find((c: { id: string }) => c.id === companyId);
    return company?.shortName || companyId;
  };

  // Table columns
  const columns: Column<VehicleType>[] = [
    {
      key: 'code',
      header: 'Mã loại',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="font-mono text-xs bg-slate-800 text-white px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Tên loại phương tiện',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-slate-800">{value}</span>
      ),
    },
    {
      key: 'category',
      header: 'Nhóm',
      sortable: true,
      width: '150px',
      render: (value: VehicleType['category']) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[value]}`}>
          {categoryLabels[value]}
        </span>
      ),
    },
    {
      key: 'payloadCapacity',
      header: 'Tải trọng',
      sortable: true,
      width: '100px',
      render: (value) => (
        <div className="flex items-center gap-1 text-slate-600">
          <Weight size={14} />
          <span className="text-sm">{value ? `${value} tấn` : '-'}</span>
        </div>
      ),
    },
    {
      key: 'fuelConsumptionNorm',
      header: 'Định mức NL',
      sortable: true,
      width: '130px',
      render: (value) => (
        <div className="flex items-center gap-1 text-amber-600">
          <Fuel size={14} />
          <span className="text-sm font-medium">{value} L/100km</span>
        </div>
      ),
    },
    {
      key: 'requiredLicense',
      header: 'Bằng lái',
      width: '80px',
      render: (value) => (
        <Badge variant={value === 'FC' ? 'danger' : value === 'C' ? 'warning' : 'info'} size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'applicableCompanies',
      header: 'Áp dụng cho',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((companyId) => (
            <Badge key={companyId} variant="info" size="sm">
              {getCompanyName(companyId)}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="neutral" size="sm">+{value.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'TT',
      width: '80px',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'neutral'} size="sm">
          {value === 'active' ? 'Hoạt động' : 'Ngưng'}
        </Badge>
      ),
    },
    {
      key: 'id',
      header: 'Thao tác',
      width: '100px',
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Stats
  const stats = useMemo(() => ({
    total: vehicleTypes.length,
    byCategory: vehicleTypes.reduce((acc, vt) => {
      acc[vt.category] = (acc[vt.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }), [vehicleTypes]);

  return (
    <div>
      <PageHeader
        title="Danh mục Loại phương tiện"
        subtitle="Quản lý định mức nhiên liệu và phân loại phương tiện vận tải"
        icon={<Truck size={24} />}
        showCompanyFilter={false}
        actions={
          <Button icon={<Plus size={16} />} onClick={openAddModal}>
            Thêm loại xe mới
          </Button>
        }
      />

      <ApiLoadBanner
        loadFailed={loadFailed && !allowMockFallback()}
        usingMockFallback={usingMockFallback}
        message={errorMessage ?? API_LOAD_FAILED_MESSAGE}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {Object.entries(categoryLabels).map(([category, label]) => (
          <div key={category} className={`rounded-lg px-4 py-3 ${categoryColors[category as VehicleType['category']].replace('text-', 'bg-').replace('-700', '-50')}`}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-xl font-bold text-slate-800">
              {stats.byCategory[category] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Fuel size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">
            ⛽ Định mức Nhiên liệu - Cost Control
          </p>
          <p className="text-sm text-blue-600 mt-0.5">
            Định mức nhiên liệu (L/100km) là cơ sở để tính toán chi phí vận tải, 
            phân tích hiệu quả xe và kiểm soát tiêu hao bất thường.
          </p>
        </div>
      </div>

      {/* Data Table */}
      {loadingMessage && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {loadingMessage}
        </div>
      )}
      {errorMessage && usingMockFallback && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {errorMessage}
        </div>
      )}
      {scopeErrorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {scopeErrorMessage}
        </div>
      )}
      <DataTable
        columns={columns}
        data={vehicleTypes}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Tìm kiếm loại phương tiện..."
        emptyMessage={isLoading ? 'Đang tải danh mục...' : 'Chưa có loại phương tiện nào'}
        actions={
          <span className="text-sm text-slate-500">
            Tổng: <span className="font-semibold">{vehicleTypes.length}</span> loại
          </span>
        }
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 xevn-safe-inline py-4 shadow-soft backdrop-blur-md">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingVehicleType ? 'Chỉnh sửa loại phương tiện' : 'Thêm loại phương tiện mới'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="xevn-safe-inline space-y-4 py-6">
              {/* Row 1: Code & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mã loại xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formFieldErrors.code
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                        : 'border-slate-300 focus:ring-xevn-accent/20 focus:border-xevn-accent'
                    }`}
                    placeholder="VD: XT-5T"
                  />
                  {formFieldErrors.code && (
                    <p className="mt-1 text-xs text-red-600">{formFieldErrors.code}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nhóm phương tiện <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as VehicleType['category'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên loại phương tiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  placeholder="VD: Xe tải 5 tấn"
                />
              </div>

              {/* Row 2: Payload & Fuel Norm */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tải trọng (tấn) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.payloadCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, payloadCapacity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Định mức NL (L/100km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.fuelConsumptionNorm}
                    onChange={(e) =>
                      setFormData({ ...formData, fuelConsumptionNorm: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: 18"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Loại nhiên liệu
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) =>
                      setFormData({ ...formData, fuelType: e.target.value as VehicleType['fuelType'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  >
                    <option value="diesel">Dầu Diesel</option>
                    <option value="gasoline">Xăng</option>
                    <option value="electric">Điện</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* License */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bằng lái yêu cầu
                  </label>
                  <select
                    value={formData.requiredLicense}
                    onChange={(e) =>
                      setFormData({ ...formData, requiredLicense: e.target.value as VehicleType['requiredLicense'] })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  >
                    <option value="B2">B2 - Xe ô tô đến 9 chỗ, xe tải dưới 3.5 tấn</option>
                    <option value="C">C - Xe tải trên 3.5 tấn</option>
                    <option value="D">D - Xe khách 10-30 chỗ</option>
                    <option value="E">E - Xe khách trên 30 chỗ</option>
                    <option value="FC">FC - Xe đầu kéo, container</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Chu kỳ bảo dưỡng (km)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.maintenanceIntervalKm}
                    onChange={(e) =>
                      setFormData({ ...formData, maintenanceIntervalKm: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                    placeholder="VD: 10000"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả
                </label>
                <AutoResizeTextarea
                  value={formData.description}
                  onChange={(v) =>
                    setFormData({ ...formData, description: v })
                  }
                  className="w-full border-slate-300 focus:ring-2 focus:ring-xevn-accent/20 focus:border-xevn-accent"
                  placeholder="Mô tả ngắn về loại phương tiện..."
                />
              </div>

              {/* Applicable Companies */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Áp dụng cho công ty <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {companies.map((company) => (
                    <label
                      key={company.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        formData.applicableCompanies.includes(company.id)
                          ? 'bg-xevn-accent/10 border-xevn-accent text-xevn-accent'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.applicableCompanies.includes(company.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              applicableCompanies: [
                                ...formData.applicableCompanies,
                                company.id,
                              ],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              applicableCompanies:
                                formData.applicableCompanies.filter(
                                  (id) => id !== company.id
                                ),
                            });
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{company.shortName ?? company.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-b-xl border-t border-slate-100 bg-slate-50/90 xevn-safe-inline py-4 shadow-soft backdrop-blur-md">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                icon={<Save size={16} />}
                onClick={() => void handleSave()}
                disabled={isSaving || !formData.code || !formData.name || !formData.fuelConsumptionNorm}
              >
                {isSaving ? 'Đang lưu...' : editingVehicleType ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTypesSettingsPage;
