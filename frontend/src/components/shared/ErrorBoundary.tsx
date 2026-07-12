import React from "react";

interface State {
  hasError: boolean;
  message?: string;
}

/** Catches render errors so a bug shows a recovery screen, not a white page. */
export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
          <p className="font-belanosima uppercase tracking-[0.4em] text-myGreen text-xs mb-3">
            A rift opened in the Nebula
          </p>
          <h1 className="font-belanosima uppercase text-3xl md:text-5xl text-white mb-3">
            Something went wrong
          </h1>
          {this.state.message && (
            <p className="font-poppins text-gray-500 text-xs max-w-md mb-6 break-all">
              {this.state.message}
            </p>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = "/";
            }}
            className="btn-glow rounded-xl font-belanosima uppercase tracking-wide text-sm px-8 py-3.5"
          >
            Return home
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
