import { memo } from "react";
import { motion } from "framer-motion";
import { obterCorStatus, obterCorFundoStatus, obterTextoStatus } from "../../utils/systemHealth";

function BadgeStatus({ status, label, children, animate = false }) {
  // Usar cores do tema ao invés de hardcoded
  const displayLabel = label || children || obterTextoStatus(status);
  
  const badgeStyle = {
    backgroundColor: obterCorFundoStatus(status),
    color: obterCorStatus(status),
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    borderRadius: '9999px',
    fontWeight: '500'
  };

  const BadgeContent = (
    <span style={badgeStyle}>{displayLabel}</span>
  );

  // D5.2 - Microanimação pulse suave para estados críticos
  if (animate && (status === 'error' || status === 'overdue' || status === 'warning' || status === 'danger')) {
    return (
      <motion.span
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {BadgeContent}
      </motion.span>
    );
  }
  
  // Animação de sucesso (verde brilhante) para recovery
  if (animate && status === 'success') {
    return (
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {BadgeContent}
      </motion.span>
    );
  }

  return BadgeContent;
}

// Memoização para evitar re-renders
export default memo(BadgeStatus);
