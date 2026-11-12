import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  isPositive?: boolean;
  strokeWidth?: number;
  showGradient?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 32,
  isPositive = true,
  strokeWidth = 1.75,
  showGradient = true,
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingY = 4;
  const effectiveHeight = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * effectiveHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  const color = isPositive ? '#089981' : '#f23645';
  const gradientId = `spark-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg width={width} height={height} className="overflow-visible block">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      {showGradient && (
        <path d={areaPath} fill={`url(#${gradientId})`} />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
