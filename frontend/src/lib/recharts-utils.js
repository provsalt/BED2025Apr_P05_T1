/**
 * charting library utilities for Recharts
 * Integrates seamlessly with React
 * Has good documentation and community support
 * Provides beautiful default styling
 * Handles responsive design well
 * Makes complex charts simple to implement
 */

// Common props that Recharts passes that React warns about
const problematicProps = new Set([
  'iconSize',
  'itemSorter', 
  'chartWidth',
  'chartHeight',
  'allowEscapeViewBox',
  'animationDuration',
  'animationEasing',
  'axisId',
  'contentStyle',
  'filterNull',
  'isAnimationActive',
  'itemStyle',
  'labelStyle',
  'reverseDirection',
  'useTranslate3d',
  'wrapperStyle',
  'accessibilityLayer'
]);

/**
 * Filters out props that cause React DOM warnings
 * @param {object} props - The props object to filter
 * @returns {object} - Filtered props object
 */
export const filterRechartsProps = (props) => {
  const filtered = {};
  
  Object.keys(props).forEach(key => {
    if (!problematicProps.has(key)) {
      filtered[key] = props[key];
    }
  });
  
  return filtered;
};

/**
 * Console filter to suppress known harmless Recharts warnings
 * Call this in development to reduce console noise
 */
export const suppressRechartsWarnings = () => {
  if (process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && 
          (message.includes('React does not recognize') || 
           message.includes('Received `false` for a non-boolean attribute'))) {
        const isRechartsWarning = problematicProps.some(prop => 
          message.includes(`\`${prop}\``) || message.includes(prop.toLowerCase())
        );
        
        if (isRechartsWarning) {
          return;
        }
      }
      
      originalError.apply(console, args);
    };
  }
};
