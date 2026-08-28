import React from 'react';
import { PayrollPolicyHub } from '@/components/payroll/PayrollPolicyHub';
import { PageHeader } from '@/components/common/PageHeader';

export default function PayrollPolicies() {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <PageHeader
        title="Chính sách lương"
        subtitle="Quản lý và cấu hình các Nhóm chính sách lương"
      />
      <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <PayrollPolicyHub />
      </div>
    </div>
  );
}