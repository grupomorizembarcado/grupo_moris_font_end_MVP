import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import apiService from "../services/api";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

const SiloDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [silo, setSilo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({ name: "", sensorCode: "" });

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    const silos = await apiService.fetchSilos();
    const found = silos.find((s) => s.silo_id === parseInt(id));
    setSilo(found);
    setFormData({
      name: found?.silo_name,
      sensorCode: found?.sensor_code
    });
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Deseja excluir o silo?")) return;
    await apiService.deleteSilo(id);
    navigate("/silos");
  };

  const handleUpdate = async () => {
    await apiService.updateSilo(id, formData);
    setShowEdit(false);
    load();
  };

  const chartData = silo?.last_20_readings
    ?.slice(0, 10)
    .map((r, i) => ({
      name: `#${i + 1}`,
      percentage: r.percentage
    }));

  if (loading || !silo) return <div className="card p-6">Carregando...</div>;

  return (
    <div className="content space-y-6">
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Voltar
      </button>

      <div className="card">
        <h2 className="card-title">{silo.silo_name}</h2>
        <p>Sensor: {silo.sensor_code}</p>
      </div>

      {/* Gráfico */}
      <div className="card">
        <h3 className="font-semibold mb-4">Últimas 10 leituras (%)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="percentage" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-4">
        <button className="btn btn-primary" onClick={() => setShowEdit(true)}>
          <FaEdit /> Editar
        </button>

        <button className="btn btn-danger" onClick={handleDelete}>
          <FaTrash /> Excluir
        </button>
      </div>

      {/* Modal Editar */}
      {showEdit && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="card-title">Editar Silo</h2>
              <button className="btn btn-secondary" onClick={() => setShowEdit(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body space-y-3">
              <input
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                className="form-control"
                value={formData.sensorCode}
                onChange={(e) => setFormData({ ...formData, sensorCode: e.target.value })}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEdit(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleUpdate}>
                <FaSave /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiloDetails;