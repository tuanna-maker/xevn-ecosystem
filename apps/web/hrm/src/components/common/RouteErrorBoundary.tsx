import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  children: ReactNode;
  /** Short label for support / QA evidence */
  routeLabel?: string;
};

type State = {
  error: Error | null;
};

/**
 * Catches lazy-route / render failures so the HRM shell (#root) stays mounted on pilot HTTPS.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[RouteErrorBoundary:${this.props.routeLabel ?? 'route'}]`, error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"
          data-testid="route-error-boundary"
          role="alert"
        >
          <p className="text-lg font-semibold text-foreground">
            Không tải được màn hình{this.props.routeLabel ? ` (${this.props.routeLabel})` : ''}
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            {this.state.error.message || 'Lỗi không xác định khi tải module.'}
          </p>
          <Button type="button" variant="outline" onClick={this.handleRetry}>
            Tải lại trang
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
