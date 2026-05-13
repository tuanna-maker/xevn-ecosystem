import * as Network from 'expo-network';

/** SRS UC-HRM-MOB-14 — thiết bị coi là không dùng được cho ghi API. */
export function deriveOffline(state: Network.NetworkState): boolean {
  if (state.type === Network.NetworkStateType.NONE) return true;
  if (state.isConnected === false) return true;
  if (state.isInternetReachable === false) return true;
  return false;
}

export async function fetchDeviceOffline(): Promise<boolean> {
  try {
    const s = await Network.getNetworkStateAsync();
    return deriveOffline(s);
  } catch {
    return false;
  }
}
