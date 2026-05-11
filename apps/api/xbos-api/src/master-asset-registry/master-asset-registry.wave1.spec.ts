type ModuleCode = 'hrm' | 'operations' | 'accounting';

type AssetRecord = {
  assetId: string;
  tenantId: string;
  assetCode: string;
  vin: string;
  chassis: string;
  maintenanceStatus: string;
  depreciationMethod: string;
  updatedAt: string;
};

type AuditEntry = {
  assetId: string;
  action: 'asset.created' | 'asset.updated';
  moduleCode: ModuleCode;
  actor: string;
  createdAt: string;
};

class ContractError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}

class Wave1AssetRegistryHarness {
  private assets = new Map<string, AssetRecord>();
  private audits: AuditEntry[] = [];
  private id = 0;

  private readonly fieldOwners: Record<string, ModuleCode> = {
    maintenanceStatus: 'operations',
    depreciationMethod: 'accounting',
  };

  create(input: {
    tenantId: string;
    assetCode: string;
    vin: string;
    chassis: string;
    actor: string;
    moduleCode: ModuleCode;
  }): AssetRecord {
    const duplicate = [...this.assets.values()].find(
      (item) =>
        item.tenantId === input.tenantId &&
        (item.assetCode === input.assetCode || item.vin === input.vin || item.chassis === input.chassis),
    );

    if (duplicate) {
      throw new ContractError('ASSET-REG-409', 'Duplicate asset identity');
    }

    const assetId = `asset-${++this.id}`;
    const created: AssetRecord = {
      assetId,
      tenantId: input.tenantId,
      assetCode: input.assetCode,
      vin: input.vin,
      chassis: input.chassis,
      maintenanceStatus: 'active',
      depreciationMethod: 'straight_line',
      updatedAt: new Date().toISOString(),
    };

    this.assets.set(assetId, created);
    this.audits.push({
      assetId,
      action: 'asset.created',
      actor: input.actor,
      moduleCode: input.moduleCode,
      createdAt: new Date().toISOString(),
    });

    return created;
  }

  update(
    assetId: string,
    patch: Partial<Pick<AssetRecord, 'maintenanceStatus' | 'depreciationMethod'>>,
    actor: string,
    moduleCode: ModuleCode,
  ): AssetRecord {
    const current = this.assets.get(assetId);
    if (!current) {
      throw new ContractError('ASSET-REG-404', 'Asset not found');
    }

    for (const key of Object.keys(patch)) {
      const owner = this.fieldOwners[key];
      if (owner && owner !== moduleCode) {
        throw new ContractError('ASSET-OWN-403', `Forbidden update for field ${key}`);
      }
    }

    const updated = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.assets.set(assetId, updated);
    this.audits.push({
      assetId,
      action: 'asset.updated',
      actor,
      moduleCode,
      createdAt: new Date().toISOString(),
    });

    return updated;
  }

  getAuditByAsset(assetId: string): AuditEntry[] {
    return this.audits.filter((item) => item.assetId === assetId);
  }
}

describe('Master Asset Registry Wave 1 quality gate contracts', () => {
  let harness: Wave1AssetRegistryHarness;

  beforeEach(() => {
    harness = new Wave1AssetRegistryHarness();
  });

  it('rejects duplicate asset creation with deterministic code', () => {
    harness.create({
      tenantId: 'tenant-a',
      assetCode: 'CAR-001',
      vin: 'VIN-001',
      chassis: 'CHS-001',
      actor: 'qa',
      moduleCode: 'operations',
    });

    try {
      harness.create({
        tenantId: 'tenant-a',
        assetCode: 'CAR-001',
        vin: 'VIN-009',
        chassis: 'CHS-009',
        actor: 'qa',
        moduleCode: 'operations',
      });
      fail('Expected duplicate creation to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ContractError);
      expect((error as ContractError).code).toBe('ASSET-REG-409');
    }
  });

  it('rejects forbidden ownership field update with deterministic code', () => {
    const created = harness.create({
      tenantId: 'tenant-a',
      assetCode: 'CAR-002',
      vin: 'VIN-002',
      chassis: 'CHS-002',
      actor: 'qa',
      moduleCode: 'operations',
    });

    try {
      harness.update(created.assetId, { depreciationMethod: 'declining_balance' }, 'qa', 'operations');
      fail('Expected forbidden ownership update to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ContractError);
      expect((error as ContractError).code).toBe('ASSET-OWN-403');
    }
  });

  it('appends create and authorized update audit entries', () => {
    const created = harness.create({
      tenantId: 'tenant-a',
      assetCode: 'CAR-003',
      vin: 'VIN-003',
      chassis: 'CHS-003',
      actor: 'qa',
      moduleCode: 'operations',
    });

    harness.update(created.assetId, { maintenanceStatus: 'in_maintenance' }, 'qa', 'operations');

    const audits = harness.getAuditByAsset(created.assetId);
    expect(audits).toHaveLength(2);
    expect(audits[0].action).toBe('asset.created');
    expect(audits[1].action).toBe('asset.updated');
    expect(audits[1].moduleCode).toBe('operations');
  });
});
