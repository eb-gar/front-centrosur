import React, { useEffect, useState } from "react";
import { PlusCircle, Trash2, Info, Pencil } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import "../../styles/admin/CategoryManager.css";
import {
  createCategory,
  fetchCategories,
  removeCategory,
  updateCategory,
} from "../../services/categoriesApi";

export default function CategoryManager({ categorias, onSave, onDelete }) {
  const [nombre, setNombre] = useState("");
  const [colorSel, setColorSel] = useState("#3b82f6");
  const [categoriasLocal, setCategoriasLocal] = useState([]);
  const [errorCarga, setErrorCarga] = useState("");
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [categoriaEditando, setCategoriaEditando] = useState(null);

  const coloresEmpresa = [
    "#0EA5E9",
    "#2563EB",
    "#F59E0B",
    "#F97316",
    "#22C55E",
    "#14B8A6",
    "#64748B",
  ];
  const categoriasSeguras = Array.isArray(categorias)
    ? categorias
    : categoriasLocal;

  const loadCategorias = async () => {
    try {
      setErrorCarga("");
      const data = await fetchCategories();
      setCategoriasLocal(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      setErrorCarga("Error de conexión al cargar categorías.");
      setCategoriasLocal([]);
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadCategorias();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const colorNormalizado = colorSel.trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(colorNormalizado)) {
      setErrorCarga(
        "El color debe tener formato hexadecimal, por ejemplo #3b82f6.",
      );
      return;
    }

    const payload = {
      name: nombre.trim(),
      color: colorNormalizado,
    };

    try {
      setErrorCarga("");
      if (typeof onSave === "function") {
        await onSave(payload, categoriaEditando?.id);
      } else {
        if (categoriaEditando) {
          await updateCategory(categoriaEditando.id, payload);
        } else {
          await createCategory(payload);
        }
        await loadCategorias();
      }
    } catch (error) {
      console.error("Error creando categoría:", error);
      setErrorCarga("Error de conexión al crear categoría.");
      return;
    }

    setNombre("");
    setColorSel("#3b82f6");
    setCategoriaEditando(null);
  };

  const iniciarEdicion = (cat) => {
    setCategoriaEditando(cat);
    setNombre(cat.name || "");
    setColorSel(cat.color || "#3b82f6");
    setErrorCarga("");
  };

  const cancelarEdicion = () => {
    setCategoriaEditando(null);
    setNombre("");
    setColorSel("#3b82f6");
  };

  const handleDelete = async (id) => {
    try {
      setErrorCarga("");
      if (typeof onDelete === "function") {
        await onDelete(id);
      } else {
        await removeCategory(id);
        await loadCategorias();
      }
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      setErrorCarga("Error de conexión al eliminar categoría.");
    }
  };

  const confirmarEliminarCategoria = async () => {
    if (!categoriaAEliminar) return;
    await handleDelete(categoriaAEliminar.id);
    setCategoriaAEliminar(null);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar activeItem="categorias" />

      <main className="admin-main">
        <div className="categories-container">
          <div className="categories-list-section">
            <header className="section-header">
              <h2>Gestión de Categorías</h2>
              <p>
                Organiza las preguntas del evento mediante etiquetas temáticas.
              </p>
            </header>

            <div className="stats-bar">
              <span>Categorías actuales</span>
              <span className="badge-count">
                {categoriasSeguras.length} TOTAL
              </span>
            </div>

            {errorCarga && (
              <p className="category-inline-error">{errorCarga}</p>
            )}

            <div className="grid-list">
              {categoriasSeguras.map((cat) => (
                <div key={cat.id} className="category-item-card">
                  <div className="cat-info">
                    <div
                      className="cat-color-badge"
                      style={{
                        backgroundColor: cat.color + "15",
                        color: cat.color,
                        borderColor: cat.color + "55",
                      }}
                    >
                      {(cat.name || "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{cat.name}</h3>
                      <span>
                        {cat._count?.questions || 0} preguntas asignadas
                      </span>
                    </div>
                  </div>
                  <div className="cat-actions">
                    <button
                      className="btn-edit-cat"
                      onClick={() => iniciarEdicion(cat)}
                      type="button"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="btn-delete-cat"
                      onClick={() => setCategoriaAEliminar(cat)}
                      type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {categoriasSeguras.length === 0 && (
                <div className="empty-placeholder">
                  <PlusCircle size={40} />
                  <p>Las nuevas categorías aparecerán aquí</p>
                </div>
              )}
            </div>
          </div>

          {/* FORMULARIO LATERAL (DERECHA) */}
          <aside className="category-form-aside">
            <div className="form-sticky-card">
              <h3>
                {categoriaEditando
                  ? "Editar Categoría"
                  : "Crear Nueva Categoría"}
              </h3>

              {categoriaEditando && (
                <p className="form-editing-label">
                  Editando: <strong>{categoriaEditando.name}</strong>
                </p>
              )}

              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>NOMBRE DE CATEGORÍA</label>
                  <input
                    type="text"
                    placeholder="Ej. Logística, Speakers..."
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>

                <div className="selection-group">
                  <label>COLOR DE CATEGORÍA</label>

                  <div className="color-preset-row">
                    {coloresEmpresa.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-dot-btn ${
                          colorSel.toLowerCase() === color.toLowerCase()
                            ? "active"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setColorSel(color)}
                        title={color}
                      />
                    ))}
                  </div>

                  <div className="color-preview-row">
                    <span className="color-preview-label">Vista previa</span>
                    <span
                      className="color-preview-chip"
                      style={{
                        backgroundColor: colorSel + "15",
                        color: colorSel,
                        borderColor: colorSel,
                      }}
                    >
                      {(nombre.trim() || "Categoria").charAt(0).toUpperCase()}{" "}
                      {nombre.trim() || "Categoria"}
                    </span>
                  </div>

                  <div className="color-manual-row">
                    <input
                      type="color"
                      value={
                        /^#[0-9A-Fa-f]{6}$/.test(colorSel)
                          ? colorSel
                          : "#3b82f6"
                      }
                      onChange={(e) => setColorSel(e.target.value)}
                      aria-label="Selector de color"
                    />
                    <input
                      type="text"
                      value={colorSel}
                      onChange={(e) => setColorSel(e.target.value)}
                      placeholder="#3b82f6"
                      maxLength={7}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-create-main">
                  {categoriaEditando ? "Guardar Cambios" : "Crear Categoría"}
                </button>

                {categoriaEditando && (
                  <button
                    type="button"
                    className="btn-cancel-edit"
                    onClick={cancelarEdicion}
                  >
                    Cancelar edición
                  </button>
                )}
              </form>

              <div className="form-info-footer">
                <Info size={14} />
                <p>
                  Las categorías ayudan a filtrar el feed principal y a generar
                  reportes post-evento.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {categoriaAEliminar && (
          <div className="confirm-overlay" role="dialog" aria-modal="true">
            <div className="confirm-modal">
              <h3>Eliminar categoría</h3>
              <p>
                ¿Estás segura de eliminar la categoría "
                <strong>{categoriaAEliminar.name}</strong>"? Esta acción no se
                puede deshacer.
              </p>
              <div className="confirm-modal-actions">
                <button
                  type="button"
                  className="btn-confirm-cancel"
                  onClick={() => setCategoriaAEliminar(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-confirm-delete"
                  onClick={confirmarEliminarCategoria}
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
