import { FaTimes, FaSave } from "react-icons/fa";

const SiloFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  icon,
  submitText,
  formData,
  setFormData
}) => {

  if (!isOpen) return null;

  return (
    <div className="saas-modal-overlay">
      <div className="saas-modal">

        {/* HEADER */}
        <div className="saas-modal-header">
          <div className="saas-modal-title">
            <div className="saas-modal-icon">
              {icon}
            </div>

            <div>
              <h2>{title}</h2>
              <span>{subtitle}</span>
            </div>
          </div>

          <button
            className="saas-modal-close"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        {/* BODY */}
        <div className="saas-modal-body">

          <div className="saas-form-group">
            <label>Nome do silo</label>
            <input
              type="text"
              placeholder="Ex: Silo Principal"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value
                })
              }
            />
          </div>

          <div className="saas-form-group">
            <label>Código do Sensor</label>
            <input
              type="text"
              placeholder="Ex: SENSOR-001"
              value={formData.sensorCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sensorCode: e.target.value
                })
              }
            />
          </div>

          {/* GRID */}
          <div className="saas-grid">

            <div className="saas-form-group">
              <label>Nível mínimo</label>
              <input
                type="number"
                value={formData.minLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minLevel: e.target.value
                  })
                }
              />
            </div>

            <div className="saas-form-group">
              <label>Nível máximo</label>
              <input
                type="number"
                value={formData.maxLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxLevel: e.target.value
                  })
                }
              />
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="saas-modal-footer">

          <button
            className="saas-btn-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="saas-btn-primary"
            onClick={onSubmit}
            disabled={!formData.name || !formData.sensorCode}
          >
            <FaSave />
            {submitText}
          </button>

        </div>

      </div>
    </div>
  );
};

export default SiloFormModal;