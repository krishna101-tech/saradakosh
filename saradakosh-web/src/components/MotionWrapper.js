/** Keep archive content visible in server HTML, even before JavaScript loads. */
export function StaggerContainer({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({ children, className = '' }) {
  return <div className={`content-enter ${className}`}>{children}</div>;
}
