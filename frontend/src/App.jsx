import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Search,
  Plus,
  LogOut,
  Package,
  Tag,
  Tags,
  TrendingUp,
  CircleDollarSign,
  AlertTriangle,
  X,
  LockKeyhole,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import {
  apiRequest,
  PRODUCTS_ENDPOINT,
  CATEGORIES_ENDPOINT,
  BRANDS_ENDPOINT,
} from "./api.js";

const emptyProduct = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  categoriaId: "",
  marcaId: "",
};

// Convierte cualquier forma de respuesta en un arreglo
function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

// ---------------------------------------------------------------
// Formulario de producto (6 campos del POST)
// ---------------------------------------------------------------
function ProductForm({ categories, brands, onCancel, onSave, busy }) {
  const [form, setForm] = useState(emptyProduct);

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function submit(event) {
    event.preventDefault();

    onSave({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion,
      precio: Number(form.precio),
      stock: Number(form.stock),
      categoriaId: Number(form.categoriaId),
      marcaId: Number(form.marcaId),
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
            <h2>Nuevo producto</h2>
            <p className="muted">Completa la información del producto.</p>
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
            value={form.nombre}
            onChange={(event) => update("nombre", event.target.value)}
            placeholder="Ej. Proteína Whey"
          />
        </label>

        <label>
          Descripción
          <textarea
            value={form.descripcion}
            onChange={(event) => update("descripcion", event.target.value)}
            placeholder="Descripción del producto"
            rows="3"
          />
        </label>

        <div className="form-grid">
          <label>
            Precio
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={form.precio}
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
              value={form.stock}
              onChange={(event) => update("stock", event.target.value)}
            />
          </label>
        </div>

        <div className="form-grid">
          <label>
            Categoría
            <select
              required
              value={form.categoriaId}
              onChange={(event) => update("categoriaId", event.target.value)}
            >
              <option value="">
                {categories.length === 0
                  ? "No hay categorías (créalas primero)"
                  : "Selecciona una categoría"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Marca
            <select
              required
              value={form.marcaId}
              onChange={(event) => update("marcaId", event.target.value)}
            >
              <option value="">
                {brands.length === 0
                  ? "No hay marcas (créalas primero)"
                  : "Selecciona una marca"}
              </option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.nombre}
                </option>
              ))}
            </select>
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

// ---------------------------------------------------------------
// Formulario simple (solo nombre) para categorías y marcas
// ---------------------------------------------------------------
function NameForm({ eyebrow, title, label, placeholder, onCancel, onSave, busy }) {
  const [nombre, setNombre] = useState("");

  function submit(event) {
    event.preventDefault();
    onSave({ nombre: nombre.trim() });
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
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p className="muted">Escribe el nombre para registrarlo.</p>
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
          {label}
          <input
            required
            autoFocus
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder={placeholder}
          />
        </label>

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
            {busy ? "Guardando..." : "Guardar"}
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

  // Datos
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Interfaz
  const [section, setSection] = useState("productos"); // productos | categorias | marcas
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null); // null | "producto" | "categoria" | "marca"
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((product) =>
      `${product.nombre ?? ""} ${product.categoria ?? ""} ${product.marca ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [products, query]);

  const filteredCategories = useMemo(
    () =>
      categories.filter((c) =>
        (c.nombre ?? "").toLowerCase().includes(query.toLowerCase())
      ),
    [categories, query]
  );

  const filteredBrands = useMemo(
    () =>
      brands.filter((b) =>
        (b.nombre ?? "").toLowerCase().includes(query.toLowerCase())
      ),
    [brands, query]
  );

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock ?? 0),
    0
  );

  const totalValue = products.reduce(
    (sum, product) =>
      sum + Number(product.precio ?? 0) * Number(product.stock ?? 0),
    0
  );

  const lowStock = products.filter(
    (product) => Number(product.stock ?? 0) <= 5
  ).length;

  // ------------------------- Cargas GET -------------------------
  async function loadProducts(currentToken = token) {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(PRODUCTS_ENDPOINT, { token: currentToken });
      setProducts(normalizeList(data));
    } catch (e) {
      setError(`No se pudieron cargar los productos: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories(currentToken = token) {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(CATEGORIES_ENDPOINT, {
        token: currentToken,
      });
      setCategories(normalizeList(data));
    } catch (e) {
      setError(`No se pudieron cargar las categorías: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadBrands(currentToken = token) {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(BRANDS_ENDPOINT, { token: currentToken });
      setBrands(normalizeList(data));
    } catch (e) {
      setError(`No se pudieron cargar las marcas: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function reloadCurrent() {
    if (section === "productos") loadProducts();
    else if (section === "categorias") loadCategories();
    else loadBrands();
  }

  // Al iniciar sesión se cargan las tres listas
  useEffect(() => {
    if (token) {
      loadProducts(token);
      loadCategories(token);
      loadBrands(token);
    }
  }, [token]);

  function changeSection(next) {
    setSection(next);
    setQuery("");
    setError("");
    setNotice("");
  }

  // ------------------------- Auth -------------------------
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
        throw new Error("La respuesta no contiene el token esperado.");
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
        throw new Error("El registro respondió, pero no devolvió un token.");
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

  function logout() {
    sessionStorage.removeItem("gestor_token");
    sessionStorage.removeItem("gestor_user");

    setToken("");
    setUsername("");
    setProducts([]);
    setCategories([]);
    setBrands([]);
    setSection("productos");
    setModal(null);
    setQuery("");
    setError("");
    setNotice("");
    setRegisterMode(false);
    setLoginUser("");
    setLoginPassword("");
    setRegisterEmail("");
    setRegisterPassword("");
  }

  // ------------------------- POST (solo creación) -------------------------
  async function saveProduct(product) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await apiRequest(PRODUCTS_ENDPOINT, {
        method: "POST",
        token,
        body: JSON.stringify(product),
      });

      setModal(null);
      setNotice("Producto creado correctamente.");
      await loadProducts();
    } catch (e) {
      setError(`No se pudo guardar el producto: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function saveCategory(body) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await apiRequest(CATEGORIES_ENDPOINT, {
        method: "POST",
        token,
        body: JSON.stringify(body),
      });

      setModal(null);
      setNotice("Categoría creada correctamente.");
      await loadCategories();
    } catch (e) {
      setError(`No se pudo guardar la categoría: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function saveBrand(body) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await apiRequest(BRANDS_ENDPOINT, {
        method: "POST",
        token,
        body: JSON.stringify(body),
      });

      setModal(null);
      setNotice("Marca creada correctamente.");
      await loadBrands();
    } catch (e) {
      setError(`No se pudo guardar la marca: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // ------------------------- Pantalla de login / registro -------------------------
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
            <span className="pill pill-dark">GESTIÓN INTELIGENTE</span>

            <h1>
              Todo tu inventario,
              <br />
              <span>en un solo lugar.</span>
            </h1>

            <p>
              Administra tus productos con claridad. Consulta existencias,
              actualiza información y mantén tu catálogo organizado.
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
              {registerMode ? "ÚNETE A STOCKWISE" : "BIENVENIDO DE NUEVO"}
            </p>

            <h2>{registerMode ? "Crear cuenta" : "Inicia sesión"}</h2>

            <p className="muted">
              {registerMode
                ? "Regístrate para comenzar a gestionar tus productos."
                : "Ingresa tus credenciales para acceder al panel."}
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            {notice && <div className="alert alert-success">{notice}</div>}

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
                autoComplete={registerMode ? "new-password" : "current-password"}
                minLength={registerMode ? 6 : undefined}
                required
                value={registerMode ? registerPassword : loginPassword}
                onChange={(event) => {
                  if (registerMode) {
                    setRegisterPassword(event.target.value);
                  } else {
                    setLoginPassword(event.target.value);
                  }
                }}
                placeholder={registerMode ? "Mínimo 6 caracteres" : "Tu contraseña"}
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
              {registerMode ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setRegisterMode((previous) => !previous);
                  setError("");
                  setNotice("");
                }}
              >
                {registerMode ? "Inicia sesión" : "Regístrate aquí"}
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

  // ------------------------- Textos según la sección -------------------------
  const sectionInfo = {
    productos: {
      eyebrow: "INVENTARIO / PRODUCTOS",
      title: "Gestor de productos",
      newLabel: "Nuevo producto",
      newModal: "producto",
      searchPlaceholder: "Buscar producto...",
    },
    categorias: {
      eyebrow: "INVENTARIO / CATEGORÍAS",
      title: "Gestor de categorías",
      newLabel: "Nueva categoría",
      newModal: "categoria",
      searchPlaceholder: "Buscar categoría...",
    },
    marcas: {
      eyebrow: "INVENTARIO / MARCAS",
      title: "Gestor de marcas",
      newLabel: "Nueva marca",
      newModal: "marca",
      searchPlaceholder: "Buscar marca...",
    },
  }[section];

  // Tabla sencilla (ID + Nombre) reutilizada por categorías y marcas
  function renderSimpleTable(items, allItems, heading, singularPlural, icon) {
    return (
      <section className="table-card">
        <div className="table-heading">
          <div>
            <h2>{heading}</h2>
            <p className="muted">Consulta y registra nuevos elementos.</p>
          </div>

          <label className="search-box">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={sectionInfo.searchPlaceholder}
            />
          </label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>NOMBRE</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="2" className="empty-state">
                    Cargando...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="2" className="empty-state">
                    <div className="empty-icon">{icon}</div>
                    <strong>No hay {singularPlural} para mostrar</strong>
                    <span>Registra la primera con el botón superior.</span>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{item.id}</td>
                    <td>
                      <strong>{item.nombre}</strong>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-foot">
          <span>
            Mostrando {items.length} de {allItems.length} {singularPlural}
          </span>
          <span>Gestión de inventario</span>
        </div>
      </section>
    );
  }

  // ------------------------- Panel principal -------------------------
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

        <div
          className={`nav-item ${section === "productos" ? "nav-active" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => changeSection("productos")}
        >
          <Package size={18} />
          Productos
          {section === "productos" && <span className="nav-dot" />}
        </div>

        <div
          className={`nav-item ${section === "categorias" ? "nav-active" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => changeSection("categorias")}
        >
          <Tags size={18} />
          Categorías
          {section === "categorias" && <span className="nav-dot" />}
        </div>

        <div
          className={`nav-item ${section === "marcas" ? "nav-active" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => changeSection("marcas")}
        >
          <Tag size={18} />
          Marcas
          {section === "marcas" && <span className="nav-dot" />}
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
            <p className="eyebrow">{sectionInfo.eyebrow}</p>
            <h1>{sectionInfo.title}</h1>
          </div>

          <div className="topbar-actions">
            <span className="status">
              <span />
              Sesión activa
            </span>

            <button className="button button-light" onClick={reloadCurrent}>
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>
        </header>

        {error && (
          <div className="alert alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={() => setError("")} className="alert-close">
              <X size={16} />
            </button>
          </div>
        )}

        {notice && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{notice}</span>
            <button onClick={() => setNotice("")} className="alert-close">
              <X size={16} />
            </button>
          </div>
        )}

        <section className="welcome-row">
          <div>
            <h2>
              {section === "productos"
                ? "Resumen de inventario"
                : section === "categorias"
                  ? "Categorías"
                  : "Marcas"}
            </h2>
            <p className="muted">
              {section === "productos"
                ? "Aquí tienes una vista general de tu catálogo."
                : "Consulta y registra los elementos disponibles."}
            </p>
          </div>

          <button
            className="button button-primary"
            onClick={() => setModal(sectionInfo.newModal)}
          >
            <Plus size={18} />
            {sectionInfo.newLabel}
          </button>
        </section>

        {section === "productos" && (
          <>
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
                  <p className="muted">Consulta los registros de tu inventario.</p>
                </div>

                <label className="search-box">
                  <Search size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={sectionInfo.searchPlaceholder}
                  />
                </label>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>NOMBRE</th>
                      <th>PRECIO</th>
                      <th>STOCK</th>
                      <th>CATEGORÍA</th>
                      <th>MARCA</th>
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
                            Si la API respondió correctamente, crea tu primer
                            producto.
                          </span>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product, index) => {
                        const stock = Number(product.stock ?? 0);
                        const price = Number(product.precio ?? 0);

                        return (
                          <tr key={product.id ?? index}>
                            <td>{product.id}</td>

                            <td>
                              <div className="product-name">
                                <span className="product-thumb">
                                  <Package size={18} />
                                </span>
                                <strong>{product.nombre}</strong>
                              </div>
                            </td>

                            <td className="price-cell">
                              {price.toLocaleString("es-CO", {
                                style: "currency",
                                currency: "COP",
                              })}
                            </td>

                            <td>
                              <span
                                className={`stock-badge ${
                                  stock <= 5 ? "stock-low" : "stock-ok"
                                }`}
                              >
                                <span />
                                {stock}
                              </span>
                            </td>

                            <td>{product.categoria ?? "—"}</td>
                            <td>{product.marca ?? "—"}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-foot">
                <span>
                  Mostrando {filteredProducts.length} de {products.length}{" "}
                  productos
                </span>
                <span>Gestión de inventario</span>
              </div>
            </section>
          </>
        )}

        {section === "categorias" &&
          renderSimpleTable(
            filteredCategories,
            categories,
            "Todas las categorías",
            "categorías",
            <Tags size={23} />
          )}

        {section === "marcas" &&
          renderSimpleTable(
            filteredBrands,
            brands,
            "Todas las marcas",
            "marcas",
            <Tag size={23} />
          )}

        <footer className="page-footer">
          Stockwise · Gestor de productos
          <span>Frontend React conectado a API REST</span>
        </footer>
      </main>

      {modal === "producto" && (
        <ProductForm
          categories={categories}
          brands={brands}
          busy={busy}
          onCancel={() => setModal(null)}
          onSave={saveProduct}
        />
      )}

      {modal === "categoria" && (
        <NameForm
          eyebrow="CATEGORÍAS"
          title="Nueva categoría"
          label="Nombre de la categoría"
          placeholder="Ej. Suplementos"
          busy={busy}
          onCancel={() => setModal(null)}
          onSave={saveCategory}
        />
      )}

      {modal === "marca" && (
        <NameForm
          eyebrow="MARCAS"
          title="Nueva marca"
          label="Nombre de la marca"
          placeholder="Ej. Marca deportiva"
          busy={busy}
          onCancel={() => setModal(null)}
          onSave={saveBrand}
        />
      )}
    </div>
  );
}