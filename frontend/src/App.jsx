
import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Search,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Package,
  TrendingUp,
  CircleDollarSign,
  AlertTriangle,
  X,
  LockKeyhole,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import { apiRequest, PRODUCTS_ENDPOINT } from "./api.js";

const emptyProduct = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
};

function normalizeProducts(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.productos)) return payload.productos;
  return [];
}

function ProductForm({ initial, onCancel, onSave, busy }) {
  const [form, setForm] = useState(initial || emptyProduct);

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function submit(event) {
    event.preventDefault();

    onSave({
      ...form,
      precio: Number(form.precio),
      stock: Number(form.stock),
    });
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">CATÁLOGO</p>
            <h2>
              {initial?.id || initial?.idProducto
                ? "Editar producto"
                : "Nuevo producto"}
            </h2>
            <p className="muted">
              Completa la información del producto.
            </p>
          </div>

          <button
            className="icon-button"
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
          >
            <X size={19} />
          </button>
        </div>

        <label>
          Nombre del producto
          <input
            required
            value={form.nombre ?? ""}
            onChange={(event) => update("nombre", event.target.value)}
            placeholder="Ej. Teclado inalámbrico"
          />
        </label>

        <label>
          Descripción
          <textarea
            value={form.descripcion ?? ""}
            onChange={(event) =>
              update("descripcion", event.target.value)
            }
            placeholder="Descripción del producto"
            rows="3"
          />
        </label>

        <div className="form-grid">
          <label>
            Precio
            <input
              required
              min="0"
              step="0.01"
              type="number"
              value={form.precio ?? ""}
              onChange={(event) => update("precio", event.target.value)}
            />
          </label>

          <label>
            Unidades en stock
            <input
              required
              min="0"
              step="1"
              type="number"
              value={form.stock ?? ""}
              onChange={(event) => update("stock", event.target.value)}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button
            className="button button-light"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            className="button button-primary"
            disabled={busy}
            type="submit"
          >
            {busy ? "Guardando..." : "Guardar producto"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  // Sesión
  const [token, setToken] = useState(
    () => sessionStorage.getItem("gestor_token") || ""
  );

  const [username, setUsername] = useState(
    () => sessionStorage.getItem("gestor_user") || ""
  );

  // Formularios de autenticación
  const [registerMode, setRegisterMode] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Productos y estado de la interfaz
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const name = product.nombre ?? product.name ?? "";
      const description =
        product.descripcion ?? product.description ?? "";

      return `${name} ${description}`
        .toLowerCase()
        .includes(query.toLowerCase());
    });
  }, [products, query]);

  const totalStock = products.reduce(
    (sum, product) =>
      sum + Number(product.stock ?? product.cantidad ?? 0),
    0
  );

  const totalValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.precio ?? product.price ?? 0) *
        Number(product.stock ?? product.cantidad ?? 0),
    0
  );

  const lowStock = products.filter(
    (product) =>
      Number(product.stock ?? product.cantidad ?? 0) <= 5
  ).length;

  // Cargar productos desde la API
  async function loadProducts(currentToken = token) {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(PRODUCTS_ENDPOINT, {
        token: currentToken,
      });

      setProducts(normalizeProducts(data));
    } catch (e) {
      setError(
        `No se pudieron cargar los productos: ${e.message}. ` +
        "Revisa el endpoint de productos y la configuración CORS."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadProducts(token);
    }
  }, [token]);

  // Iniciar sesión
  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: loginUser,
          password: loginPassword,
        }),
      });

      if (!result?.token) {
        throw new Error(
          "La respuesta no contiene el token esperado."
        );
      }

      sessionStorage.setItem("gestor_token", result.token);
      sessionStorage.setItem("gestor_user", loginUser);

      setToken(result.token);
      setUsername(loginUser);
      setNotice("Sesión iniciada correctamente.");
    } catch (e) {
      setError(`No se pudo iniciar sesión: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Registrar una cuenta nueva
  async function register(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
        }),
      });

      if (!result?.token) {
        throw new Error(
          "El registro respondió, pero no devolvió un token."
        );
      }

      sessionStorage.setItem("gestor_token", result.token);
      sessionStorage.setItem("gestor_user", registerEmail);

      setToken(result.token);
      setUsername(registerEmail);
      setNotice("Cuenta creada correctamente.");
    } catch (e) {
      setError(`No se pudo crear la cuenta: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Cerrar sesión
  function logout() {
    sessionStorage.removeItem("gestor_token");
    sessionStorage.removeItem("gestor_user");

    setToken("");
    setUsername("");
    setProducts([]);
    setError("");
    setNotice("");
    setRegisterMode(false);
    setLoginUser("");
    setLoginPassword("");
    setRegisterEmail("");
    setRegisterPassword("");
  }

  // Crear o actualizar un producto
  async function saveProduct(product) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const editing = Boolean(modal?.product);
      const id =
        modal?.product?.id ?? modal?.product?.idProducto;

      const path = editing
        ? `${PRODUCTS_ENDPOINT}/${id}`
        : PRODUCTS_ENDPOINT;

      await apiRequest(path, {
        method: editing ? "PUT" : "POST",
        token,
        body: JSON.stringify(product),
      });

      setModal(null);
      setNotice(
        editing
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente."
      );

      await loadProducts();
    } catch (e) {
      setError(`No se pudo guardar el producto: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Eliminar un producto
  async function deleteProduct(product) {
    const id = product.id ?? product.idProducto;
    const name = product.nombre ?? product.name ?? "este producto";

    if (id == null) {
      setError("No se encontró el identificador del producto.");
      return;
    }

    if (!window.confirm(`¿Seguro que quieres eliminar "${name}"?`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await apiRequest(`${PRODUCTS_ENDPOINT}/${id}`, {
        method: "DELETE",
        token,
      });

      setNotice("Producto eliminado correctamente.");
      await loadProducts();
    } catch (e) {
      setError(`No se pudo eliminar el producto: ${e.message}`);
    }
  }

  // Pantalla de inicio de sesión y registro
  if (!token) {
    return (
      <main className="login-page">
        <section className="login-visual">
          <div className="brand brand-light">
            <span className="brand-icon">
              <Boxes size={23} />
            </span>
            <span>Stockwise</span>
          </div>

          <div className="login-promo">
            <span className="pill pill-dark">
              GESTIÓN INTELIGENTE
            </span>

            <h1>
              Todo tu inventario,
              <br />
              <span>en un solo lugar.</span>
            </h1>

            <p>
              Administra tus productos con claridad. Consulta
              existencias, actualiza información y mantén tu
              catálogo organizado.
            </p>

            <div className="visual-stat">
              <div className="stat-symbol">
                <TrendingUp size={20} />
              </div>

              <div>
                <strong>Control simple</strong>
                <small>Una vista clara de tus productos</small>
              </div>

              <ArrowUpRight className="stat-arrow" />
            </div>
          </div>

          <div className="login-footer">
            GESTOR DE PRODUCTOS · API SPRING BOOT
          </div>
        </section>

        <section className="login-form-side">
          <form
            className="login-card"
            onSubmit={registerMode ? register : login}
          >
            <div className="mobile-brand brand">
              <span className="brand-icon">
                <Boxes size={22} />
              </span>
              <span>Stockwise</span>
            </div>

            <div className="login-icon">
              <LockKeyhole size={23} />
            </div>

            <p className="eyebrow">
              {registerMode
                ? "ÚNETE A STOCKWISE"
                : "BIENVENIDO DE NUEVO"}
            </p>

            <h2>
              {registerMode ? "Crear cuenta" : "Inicia sesión"}
            </h2>

            <p className="muted">
              {registerMode
                ? "Regístrate para comenzar a gestionar tus productos."
                : "Ingresa tus credenciales para acceder al panel."}
            </p>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {notice && (
              <div className="alert alert-success">
                {notice}
              </div>
            )}

            <label>
              Correo electrónico
              <input
                type="email"
                autoComplete="email"
                required
                value={registerMode ? registerEmail : loginUser}
                onChange={(event) => {
                  if (registerMode) {
                    setRegisterEmail(event.target.value);
                  } else {
                    setLoginUser(event.target.value);
                  }
                }}
                placeholder="correo@ejemplo.com"
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                autoComplete={
                  registerMode ? "new-password" : "current-password"
                }
                minLength={registerMode ? 6 : undefined}
                required
                value={
                  registerMode ? registerPassword : loginPassword
                }
                onChange={(event) => {
                  if (registerMode) {
                    setRegisterPassword(event.target.value);
                  } else {
                    setLoginPassword(event.target.value);
                  }
                }}
                placeholder={
                  registerMode
                    ? "Mínimo 6 caracteres"
                    : "Tu contraseña"
                }
              />
            </label>

            <button
              className="button button-primary button-wide"
              disabled={busy}
              type="submit"
            >
              {busy
                ? "Procesando..."
                : registerMode
                  ? "Crear mi cuenta"
                  : "Entrar al panel"}

              <ArrowUpRight size={17} />
            </button>

            <p className="register-link">
              {registerMode
                ? "¿Ya tienes una cuenta?"
                : "¿No tienes una cuenta?"}
              {" "}

              <button
                type="button"
                onClick={() => {
                  setRegisterMode((previous) => !previous);
                  setError("");
                  setNotice("");
                }}
              >
                {registerMode
                  ? "Inicia sesión"
                  : "Regístrate aquí"}
              </button>
            </p>

            <p className="login-hint">
              {registerMode
                ? "El correo debe ser válido y la contraseña debe tener al menos 6 caracteres."
                : "Utiliza tu correo y contraseña registrados."}
            </p>
          </form>
        </section>
      </main>
    );
  }

  // Panel principal de productos
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">
            <Boxes size={22} />
          </span>
          <span>Stockwise</span>
        </div>

        <p className="nav-caption">MENÚ PRINCIPAL</p>

        <div className="nav-item nav-active">
          <Package size={18} />
          Productos
          <span className="nav-dot" />
        </div>

        <div className="sidebar-bottom">
          <div className="user-avatar">
            {(username || "U").slice(0, 1).toUpperCase()}
          </div>

          <div className="user-info">
            <strong>{username || "Usuario"}</strong>
            <small>Sesión activa</small>
          </div>

          <button
            className="icon-button"
            onClick={logout}
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">INVENTARIO / PRODUCTOS</p>
            <h1>Gestor de productos</h1>
          </div>

          <div className="topbar-actions">
            <span className="status">
              <span />
              Sesión activa
            </span>

            <button
              className="button button-light"
              onClick={() => loadProducts()}
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>
        </header>

        {error && (
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="alert-close"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {notice && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              className="alert-close"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="welcome-row">
          <div>
            <h2>Resumen de inventario</h2>
            <p className="muted">
              Aquí tienes una vista general de tu catálogo.
            </p>
          </div>

          <button
            className="button button-primary"
            onClick={() => setModal({ product: null })}
          >
            <Plus size={18} />
            Nuevo producto
          </button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-top">
              <span>Total de productos</span>
              <span className="stat-icon purple">
                <Boxes size={19} />
              </span>
            </div>
            <strong>{products.length}</strong>
            <small>Referencias en el catálogo</small>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span>Unidades en stock</span>
              <span className="stat-icon blue">
                <Package size={19} />
              </span>
            </div>
            <strong>{totalStock.toLocaleString("es-CO")}</strong>
            <small>Unidades registradas</small>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span>Valor del inventario</span>
              <span className="stat-icon green">
                <CircleDollarSign size={19} />
              </span>
            </div>
            <strong>
              {totalValue.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              })}
            </strong>
            <small>Precio por unidades</small>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span>Stock bajo</span>
              <span className="stat-icon orange">
                <AlertTriangle size={19} />
              </span>
            </div>
            <strong>{lowStock}</strong>
            <small>Productos con 5 unidades o menos</small>
          </div>
        </section>

        <section className="table-card">
          <div className="table-heading">
            <div>
              <h2>Todos los productos</h2>
              <p className="muted">
                Consulta y administra los registros de tu inventario.
              </p>
            </div>

            <label className="search-box">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar producto..."
              />
            </label>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PRODUCTO</th>
                  <th>DESCRIPCIÓN</th>
                  <th>PRECIO</th>
                  <th>STOCK</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      Cargando productos...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <div className="empty-icon">
                        <Package size={23} />
                      </div>
                      <strong>No hay productos para mostrar</strong>
                      <span>
                        Si la API respondió correctamente, crea tu primer producto.
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => {
                    const stock = Number(
                      product.stock ?? product.cantidad ?? 0
                    );

                    const name =
                      product.nombre ??
                      product.name ??
                      `Producto ${index + 1}`;

                    const price = Number(
                      product.precio ?? product.price ?? 0
                    );

                    return (
                      <tr
                        key={
                          product.id ??
                          product.idProducto ??
                          index
                        }
                      >
                        <td>
                          <div className="product-name">
                            <span className="product-thumb">
                              <Package size={18} />
                            </span>
                            <strong>{name}</strong>
                          </div>
                        </td>

                        <td className="description-cell">
                          {product.descripcion ??
                            product.description ??
                            "—"}
                        </td>

                        <td className="price-cell">
                          {price.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                          })}
                        </td>

                        <td>{stock}</td>

                        <td>
                          <span
                            className={`stock-badge ${
                              stock <= 5 ? "stock-low" : "stock-ok"
                            }`}
                          >
                            <span />
                            {stock <= 5 ? "Stock bajo" : "Disponible"}
                          </span>
                        </td>

                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-button edit-action"
                              title="Editar"
                              onClick={() =>
                                setModal({ product })
                              }
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="icon-button delete-action"
                              title="Eliminar"
                              onClick={() => deleteProduct(product)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="table-foot">
            <span>
              Mostrando {filteredProducts.length} de {products.length} productos
            </span>
            <span>Gestión de inventario</span>
          </div>
        </section>

        <footer className="page-footer">
          Stockwise · Gestor de productos
          <span>Frontend React conectado a API REST</span>
        </footer>
      </main>

      {modal && (
        <ProductForm
          key={
            modal.product?.id ??
            modal.product?.idProducto ??
            "nuevo"
          }
          initial={
            modal.product
              ? {
                  ...emptyProduct,
                  ...modal.product,
                  nombre:
                    modal.product.nombre ??
                    modal.product.name ??
                    "",
                  descripcion:
                    modal.product.descripcion ??
                    modal.product.description ??
                    "",
                  precio:
                    modal.product.precio ??
                    modal.product.price ??
                    "",
                  stock:
                    modal.product.stock ??
                    modal.product.cantidad ??
                    "",
                }
              : emptyProduct
          }
          busy={busy}
          onCancel={() => setModal(null)}
          onSave={saveProduct}
        />
      )}
    </div>
  );
}
