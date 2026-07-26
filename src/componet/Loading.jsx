const Loading = () => (
  <div
    className="flex min-h-[100dvh] items-center justify-center bg-black"
    role="status"
    aria-label="Loading"
  >
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
  </div>
);

export default Loading;
