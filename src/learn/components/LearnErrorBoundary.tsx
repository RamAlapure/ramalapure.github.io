import { Component, type ErrorInfo, type ReactNode } from 'react';
import { LearnErrorFallback } from './LearnErrorFallback';

interface LearnErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface LearnErrorBoundaryState {
  error: Error | null;
}

export class LearnErrorBoundary extends Component<LearnErrorBoundaryProps, LearnErrorBoundaryState> {
  state: LearnErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): LearnErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Learn app render error:', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.error) {
      return <LearnErrorFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}
