import { useSystemSettingsContext } from '../contexts/SystemSettingsContext';

export type { SystemSettings } from '../contexts/SystemSettingsContext';

/** Usa o contexto global de configurações (fonte única no app). */
export const useSystemSettings = useSystemSettingsContext;

