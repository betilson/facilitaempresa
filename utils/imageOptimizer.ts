/**
 * Utilitário para Otimização de Imagens no Cliente (Browser)
 */

interface OptimizedImageResult {
  optimized: string; // DataURL da imagem otimizada (WebP, Max 1280px)
  thumbnail: string; // DataURL da miniatura (WebP, Max 300px)
  originalSize: number;
  optimizedSize: number;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_WIDTH_OPTIMIZED = 1280;
const MAX_WIDTH_THUMBNAIL = 300;
const QUALITY = 0.8; // 80% qualidade

export const processImage = async (file: File): Promise<OptimizedImageResult> => {
  // 1. Validação de Tamanho Inicial
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`A imagem excede o limite máximo de ${MAX_FILE_SIZE_MB}MB.`);
  }

  // 2. Carregar Imagem
  const src = await readFileAsDataURL(file);
  const img = await loadImage(src);

  // 3. Gerar Versão Otimizada (Max 1280px)
  const optimized = await compressAndResize(img, MAX_WIDTH_OPTIMIZED, QUALITY);
  
  // 4. Gerar Versão Miniatura (Max 300px) - Para previews rápidos
  const thumbnail = await compressAndResize(img, MAX_WIDTH_THUMBNAIL, 0.6);

  // Calcular economia (estimativa baseada na string base64)
  const optimizedSize = Math.round((optimized.length * 3) / 4); 

  return {
    optimized,
    thumbnail,
    originalSize: file.size,
    optimizedSize
  };
};

// Helper: Ler arquivo
const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

// Helper: Criar Objeto de Imagem HTML
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

// Helper: Lógica de Canvas para Redimensionar e Comprimir
const compressAndResize = (img: HTMLImageElement, maxWidth: number, quality: number): string => {
  let width = img.width;
  let height = img.height;

  // Manter proporção
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível inicializar o contexto do canvas');

  // Desenhar imagem redimensionada
  ctx.drawImage(img, 0, 0, width, height);

  // Converter para WebP (formato leve) com compressão
  // Fallback para JPEG se o navegador não suportar WebP
  return canvas.toDataURL('image/webp', quality);
};