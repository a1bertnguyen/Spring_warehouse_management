export default function LoadingState({ message = 'Loading data...' }) {
  return <div className="loading-box">{message}</div>;
}
