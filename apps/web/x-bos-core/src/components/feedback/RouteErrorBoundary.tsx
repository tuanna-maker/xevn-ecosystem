import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Route rendering failed', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-700">
          Không thể tải module màn hình. Vui lòng thử tải lại trang.
        </div>
      );
    }
    return this.props.children;
  }
}
