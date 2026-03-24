import clsx from "clsx";

/**
 * Skeleton - Componente de loading placeholder
 * @param {string} variant - "text" | "card" | "avatar" | "button"
 * @param {string} width - Largura customizada
 * @param {string} height - Altura customizada
 * @param {boolean} circle - Forçar círculo (para avatares)
 */
export function Skeleton({ 
  variant = "text", 
  width, 
  height, 
  circle = false,
  className 
}) {
  const baseStyles = "bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-shimmer bg-[length:2000px_100%]";
  
  const variants = {
    text: "h-4 rounded",
    card: "h-32 rounded-xl",
    avatar: "w-10 h-10 rounded-full",
    button: "h-10 rounded-lg",
  };

  return (
    <div
      className={clsx(
        baseStyles,
        variants[variant],
        circle && "rounded-full",
        className
      )}
      style={{ width, height }}
      role="status"
      aria-label="Carregando..."
    />
  );
}
