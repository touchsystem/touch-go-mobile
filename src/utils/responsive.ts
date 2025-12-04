import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Baseado em um design de referência (iPhone 12/13 - 390x844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Escala um valor baseado na largura da tela
 * @param size - Tamanho base em pixels
 * @returns Tamanho escalado
 */
export const scaleWidth = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(size * scale);
};

/**
 * Escala um valor baseado na altura da tela
 * @param size - Tamanho base em pixels
 * @returns Tamanho escalado
 */
export const scaleHeight = (size: number): number => {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  return Math.round(size * scale);
};

/**
 * Escala um valor baseado na menor dimensão (largura ou altura)
 * @param size - Tamanho base em pixels
 * @returns Tamanho escalado
 */
export const scale = (size: number): number => {
  const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, SCREEN_HEIGHT / BASE_HEIGHT);
  return Math.round(size * scale);
};

/**
 * Escala o tamanho da fonte de forma mais conservadora
 * @param size - Tamanho da fonte base
 * @returns Tamanho da fonte escalado
 */
export const scaleFont = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Retorna a largura da tela
 */
export const getScreenWidth = (): number => SCREEN_WIDTH;

/**
 * Retorna a altura da tela
 */
export const getScreenHeight = (): number => SCREEN_HEIGHT;

/**
 * Retorna uma porcentagem da largura da tela
 * @param percentage - Porcentagem (0-100)
 */
export const widthPercentage = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Retorna uma porcentagem da altura da tela
 * @param percentage - Porcentagem (0-100)
 */
export const heightPercentage = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

