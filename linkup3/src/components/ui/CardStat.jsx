import { memo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";
import { Skeleton } from "./Skeleton";
import { motion } from "framer-motion";

/**
 * CardStat - Card de estatística com variantes e loading state (MEMOIZED + D5.2 Microanimations)
 * @param {string} title - Título do card
 * @param {string|number} value - Valor principal
 * @param {Component} icon - Ícone do Lucide React
 * @param {number} trend - Tendência percentual (positivo/negativo)
 * @param {string} variant - "default" | "primary" | "success" | "warning" | "danger" | "info"
 * @param {string} size - "small" | "medium" | "large"
 * @param {boolean} loading - Estado de carregamento
 * @param {string} subtitle - Texto adicional abaixo do valor
 */
function CardStat({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = "default",
  size = "medium",
  loading = false,
  subtitle,
  className
}) {
  const variants = {
    default: { backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' },
    primary: { background: 'linear-gradient(to bottom right, rgba(0, 48, 73, 0.05), var(--color-card))', border: '1px solid rgba(0, 48, 73, 0.2)' },
    success: { background: 'linear-gradient(to bottom right, rgba(69, 183, 73, 0.05), var(--color-card))', border: '1px solid rgba(69, 183, 73, 0.2)' },
    warning: { background: 'linear-gradient(to bottom right, rgba(255, 183, 3, 0.05), var(--color-card))', border: '1px solid rgba(255, 183, 3, 0.2)' },
    danger: { background: 'linear-gradient(to bottom right, rgba(230, 57, 70, 0.05), var(--color-card))', border: '1px solid rgba(230, 57, 70, 0.2)' },
    info: { background: 'linear-gradient(to bottom right, rgba(37, 99, 235, 0.05), var(--color-card))', border: '1px solid rgba(37, 99, 235, 0.2)' },
  };

  const iconVariants = {
    default: "bg-neutral-100 text-neutral-600",
    primary: "bg-primary-100 text-primary-600",
    success: "bg-green-100 text-green-600",
    warning: "bg-amber-100 text-amber-600",
    danger: "bg-red-100 text-red-600",
    info: "bg-blue-100 text-blue-600",
  };

  const sizes = {
    small: {
      container: "p-4",
      title: "text-xs",
      value: "text-xl",
      icon: "h-8 w-8",
      iconSize: "h-4 w-4",
    },
    medium: {
      container: "p-6",
      title: "text-sm",
      value: "text-3xl",
      icon: "h-12 w-12",
      iconSize: "h-6 w-6",
    },
    large: {
      container: "p-8",
      title: "text-base",
      value: "text-4xl",
      icon: "h-16 w-16",
      iconSize: "h-8 w-8",
    },
  };

  const sizeConfig = sizes[size];

  if (loading) {
    return (
      <div
        className={clsx(
          "rounded-xl",
          sizeConfig.container,
          className
        )}
        style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" height="2rem" />
            <Skeleton variant="text" width="30%" />
          </div>
          <Skeleton variant="avatar" className={sizeConfig.icon} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        "rounded-xl cursor-pointer",
        sizeConfig.container,
        className
      )}
      style={{
        ...variants[variant],
        boxShadow: 'var(--shadow-card)',
      }}
      tabIndex={0}
      aria-label={`${title}: ${value}`}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={sizeConfig.title} style={{ fontWeight: '500', color: 'var(--color-text-secondary)' }}>
            {title}
          </p>
          <p className={clsx("mt-2 font-bold", sizeConfig.value)} style={{ color: 'var(--color-text-primary)' }}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>
          )}
          {trend !== undefined && trend !== null && (
            <div
              className={clsx(
                "mt-2 flex items-center text-sm font-medium",
                trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-neutral-500"
              )}
              aria-label={`Tendência de ${trend > 0 ? 'aumento' : trend < 0 ? 'diminuição' : 'estabilidade'}: ${Math.abs(trend)}%`}
            >
              {trend > 0 ? (
                <TrendingUp className="mr-1 h-4 w-4" aria-hidden="true" />
              ) : trend < 0 ? (
                <TrendingDown className="mr-1 h-4 w-4" aria-hidden="true" />
              ) : null}
              {trend !== 0 && `${Math.abs(trend)}%`}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={clsx(
              "flex items-center justify-center rounded-xl transition-transform duration-200 hover:scale-110",
              iconVariants[variant],
              sizeConfig.icon
            )}
            aria-hidden="true"
          >
            <Icon className={sizeConfig.iconSize} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Memoização para evitar re-renders desnecessários
export default memo(CardStat);
