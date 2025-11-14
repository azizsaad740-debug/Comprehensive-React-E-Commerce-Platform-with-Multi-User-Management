import { v4 as uuidv4 } from 'uuid';

interface POSLinkState {
  sessionId: string | null;
  scannedData: string | null;
  isMobileConnected: boolean;
}

let currentPOSLinkState: POSLinkState = {
  sessionId: null,
  scannedData: null,
  isMobileConnected: false,
};

/**
 * Generates a new session ID and returns the mock local network URL.
 * In a real app, this would involve getting the PC's local IP address.
 */
export const startPOSSession = (): { sessionId: string, localUrl: string } => {
  const sessionId = uuidv4();
  currentPOSLinkState = {
    sessionId,
    scannedData: null,
    isMobileConnected: false,
  };
  
  // Mock local IP address for demonstration
  const mockLocalIp = '192.168.1.100';
  const localUrl = `http://${mockLocalIp}:8080/admin/pos/scan?session=${sessionId}`;
  
  return { sessionId, localUrl };
};

/**
 * Simulates the mobile device connecting to the session.
 */
export const connectMobileScanner = (sessionId: string): boolean => {
  if (currentPOSLinkState.sessionId === sessionId) {
    currentPOSLinkState.isMobileConnected = true;
    return true;
  }
  return false;
};

/**
 * Simulates the mobile device sending scanned data back to the PC.
 */
export const sendScannedData = (sessionId: string, data: string): boolean => {
  if (currentPOSLinkState.sessionId === sessionId && currentPOSLinkState.isMobileConnected) {
    currentPOSLinkState.scannedData = data;
    return true;
  }
  return false;
};

/**
 * Simulates the PC polling for new scanned data.
 */
export const pollScannedData = (sessionId: string): string | null => {
  if (currentPOSLinkState.sessionId === sessionId && currentPOSLinkState.scannedData) {
    const data = currentPOSLinkState.scannedData;
    currentPOSLinkState.scannedData = null; // Clear data after reading
    return data;
  }
  return null;
};

export const disconnectPOSSession = (sessionId: string) => {
  if (currentPOSLinkState.sessionId === sessionId) {
    currentPOSLinkState.sessionId = null;
    currentPOSLinkState.scannedData = null;
    currentPOSLinkState.isMobileConnected = false;
  }
};

export const getSessionStatus = (sessionId: string) => {
    return currentPOSLinkState.sessionId === sessionId ? currentPOSLinkState.isMobileConnected : false;
}