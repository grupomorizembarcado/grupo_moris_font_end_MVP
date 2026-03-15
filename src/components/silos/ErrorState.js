const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="content">
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-error mb-2">
              Erro ao carregar dados
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>

          <button className="btn btn-primary mt-4" onClick={onRetry}>
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;