import PropTypes from 'prop-types';

const AsyncState = ({ loading = false, error = '', onRetry = null, empty = '', children = null }) => {
  if (loading) return <p className="p-6 text-gray-500" role="status">Loading…</p>;
  if (error) {
    return (
      <div className="p-6 text-red-600" role="alert">
        <p>{error}</p>
        {onRetry && <button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-[#578C7A] px-3 py-2 text-sm font-medium text-[#3B6255]">Try again</button>}
      </div>
    );
  }
  if (empty) return <p className="p-6 text-gray-500">{empty}</p>;
  return children;
};

AsyncState.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
  empty: PropTypes.string,
  children: PropTypes.node,
};

export default AsyncState;
