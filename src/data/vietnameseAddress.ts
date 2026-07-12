/**
 * Vietnamese Provinces & Wards Utility
 *
 * Data source: https://github.com/thanglequoc/vietnamese-provinces-database
 * Dataset: vn_only_simplified_json_generated_data_vn_units_minified.json
 * Last updated: v3.1.0 (Decree 30/2026/QH16, effective 30/04/2026)
 * Contains: 34 provinces/cities with all wards (Phường/Xã)
 */

import rawData from './vn_provinces.json';

export interface Ward {
  Code: string;
  FullName: string;
  ProvinceCode: string;
}

export interface Province {
  Code: string;
  FullName: string;
  Wards: Ward[];
}

// Cast the raw JSON to typed data
const provinces: Province[] = rawData as Province[];

/**
 * Get all provinces/cities as a sorted list (by name)
 */
export function getProvinces(): Province[] {
  return [...provinces].sort((a, b) =>
    a.FullName.localeCompare(b.FullName, 'vi')
  );
}

/**
 * Get all province names (for use in dropdowns, etc.)
 */
export function getProvinceNames(): string[] {
  return getProvinces().map((p) => p.FullName);
}

/**
 * Find a province by its full name (exact match)
 */
export function getProvinceByName(name: string): Province | undefined {
  return provinces.find((p) => p.FullName === name);
}

/**
 * Find a province by its code
 */
export function getProvinceByCode(code: string): Province | undefined {
  return provinces.find((p) => p.Code === code);
}

/**
 * Get all wards for a given province name
 */
export function getWardsByProvinceName(provinceName: string): Ward[] {
  const province = getProvinceByName(provinceName);
  if (!province) return [];
  return [...province.Wards].sort((a, b) =>
    a.FullName.localeCompare(b.FullName, 'vi')
  );
}

/**
 * Get all wards for a given province code
 */
export function getWardsByProvinceCode(provinceCode: string): Ward[] {
  const province = getProvinceByCode(provinceCode);
  if (!province) return [];
  return [...province.Wards].sort((a, b) =>
    a.FullName.localeCompare(b.FullName, 'vi')
  );
}

/**
 * Get ward names for a given province name (for use in dropdowns)
 */
export function getWardNamesByProvinceName(provinceName: string): string[] {
  return getWardsByProvinceName(provinceName).map((w) => w.FullName);
}

/**
 * Search provinces by partial name (case-insensitive, accent-aware)
 */
export function searchProvinces(query: string): Province[] {
  const q = query.toLowerCase();
  return provinces.filter((p) => p.FullName.toLowerCase().includes(q));
}

/**
 * Search wards within a province by partial name
 */
export function searchWards(provinceName: string, query: string): Ward[] {
  const q = query.toLowerCase();
  return getWardsByProvinceName(provinceName).filter((w) =>
    w.FullName.toLowerCase().includes(q)
  );
}

export default provinces;
