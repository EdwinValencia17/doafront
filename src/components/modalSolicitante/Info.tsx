export const Info = ({ label, value }: { label: string; value?: any }) => (
  <div className="info" style={{ minWidth: 0 }}>
    <div className="info-label muted">{label}</div>
    <div className="info-value">{value ?? '-'}</div>
  </div>
);
