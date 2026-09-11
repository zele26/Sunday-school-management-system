import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-600">
          <h2 className="text-lg font-bold mb-2">ያልተጠበቀ ስህተት ተከስቷል</h2>
          <p className="mb-4">ይህንን ገጽ በማቅረብ ሂደት ላይ ያልተጠበቀ ችግር አጋጥሟል። እባክዎ ገጹን ዳግም ይጫኑ።</p>
          <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-auto">{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
