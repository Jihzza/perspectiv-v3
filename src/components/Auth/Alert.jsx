export function ErrorAlert({ children }) {
    if (!children) return null;
    return (
      <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
        {children}
      </div>
    );
  }
  
  export function InfoAlert({ children }) {
    if (!children) return null;
    return (
      <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm">
        {children}
      </div>
    );
  }
  
  export function SuccessAlert({ children }) {
    if (!children) return null;
    return (
      <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 mb-4">
        {children}
      </div>
    );
  }