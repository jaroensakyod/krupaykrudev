type MaterialIconProps = {
  name: string;
  className?: string;
  filled?: boolean;
  style?: React.CSSProperties;
};

/** Google Material Symbols icon (font loaded in layout head). */
export function MaterialIcon({ name, className = "", filled = false, style }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: filled ? "'FILL' 1" : undefined,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
