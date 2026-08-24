/**
 * Shared VP Hà Nội department / job title label → catalog code maps.
 */

export const JOB_TITLE_ALIASES = {
  D: 'Điều phối',
};

export const DEPARTMENT_ALIASES = {
  'Ban giám đốc': 'PHÒNG X',
  'Tổ Trợ lý - Thư Ký': 'Tổ trợ lý - Thư Ký',
};

export function cleanStr(v) {
  if (v == null) return '';
  return String(v).replace(/\s+/g, ' ').trim();
}

export function slugCode(label) {
  const map = {
    à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
    ă: 'a', ằ: 'a', ắ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
    â: 'a', ầ: 'a', ấ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
    è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
    ê: 'e', ề: 'e', ế: 'e', ể: 'e', ễ: 'e', ệ: 'e',
    ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
    ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
    ô: 'o', ồ: 'o', ố: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
    ơ: 'o', ờ: 'o', ớ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
    ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
    ư: 'u', ừ: 'u', ứ: 'u', ử: 'u', ữ: 'u', ự: 'u',
    ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
    đ: 'd',
  };
  let s = cleanStr(label).toLowerCase();
  s = s.replace(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g, (ch) => map[ch] ?? ch);
  s = s.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/_+/g, '_');
  return s.toUpperCase() || 'UNKNOWN';
}

export function normalizeDepartmentLabel(label) {
  const raw = cleanStr(label);
  return DEPARTMENT_ALIASES[raw] ?? raw;
}

export function normalizeJobTitleLabel(label) {
  const raw = cleanStr(label);
  return JOB_TITLE_ALIASES[raw] ?? raw;
}

export function buildCatalogMaps(payrollRows) {
  const deptLabelToCode = new Map();
  const jobLabelToCode = new Map();

  for (const row of payrollRows) {
    const deptLabel = normalizeDepartmentLabel(row.department);
    if (deptLabel && !deptLabelToCode.has(deptLabel)) {
      deptLabelToCode.set(deptLabel, slugCode(deptLabel));
    }
    const jobLabel = normalizeJobTitleLabel(row.job_title);
    if (jobLabel && !jobLabelToCode.has(jobLabel)) {
      jobLabelToCode.set(jobLabel, slugCode(jobLabel));
    }
  }

  return { deptLabelToCode, jobLabelToCode };
}
