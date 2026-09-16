import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOrders } from "../../context/OrdersContext";
import { useToast } from "../../context/ToastContext";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { PRIORITIES, PAYMENT_METHODS, canEditOrder } from "../../data/orders";
import { ROLES } from "../../data/users";
import Spinner from "../../components/Spinner";
import Icon from "../../components/Icon";

function emptyForm() {
  return {
    customerId: "",
    customerName: "",
    customerPhone: "",
    pickup: "",
    delivery: "",
    packageDetails: "",
    priority: "Standard",
    paymentMethod: "Cash on delivery",
  };
}

export default function OrderForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user, users } = useAuth();
  const { getOrder, createOrder, editOrderDetails } = useOrders();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, runSubmit] = useAsyncAction();

  // Registered customer accounts a business can link an order to. This is what
  // actually connects an order to a Customer's login — without it, "My orders"
  // has nothing to match against.
  const customerAccounts = users.filter((u) => u.role === ROLES.CUSTOMER);

  // Order data is already resolved by the time this page can render (see the
  // app boot gate + ProtectedRoute in App.jsx), so an edit for an unknown id
  // shows the not-found state immediately rather than behind a fake delay.
  const existing = isEdit ? getOrder(id) : null;
  const [form, setForm] = useState(() =>
    existing
      ? {
          customerId: existing.customerId || "",
          customerName: existing.customerName,
          customerPhone: existing.customerPhone,
          pickup: existing.pickup,
          delivery: existing.delivery,
          packageDetails: existing.packageDetails,
          priority: existing.priority,
          paymentMethod: existing.paymentMethod,
        }
      : emptyForm()
  );
  const [error, setError] = useState("");

  if (isEdit && !existing) {
    return (
      <div className="notfound">
        <p className="eyebrow">Not found</p>
        <h1 className="page-title">No order matches "{id}"</h1>
        <button className="btn btn-amber" onClick={() => navigate("/business/orders")}>
          Back to orders
        </button>
      </div>
    );
  }

  // Belt-and-suspenders against a direct/stale link to the edit route: even
  // if someone reaches this page for an order that has since moved to
  // Picked up (or later), the form never renders — and editOrderDetails
  // below would reject the write anyway even if this check were bypassed.
  if (isEdit && existing && !canEditOrder(existing.status)) {
    return (
      <div className="notfound">
        <div className="empty-state-icon" style={{ margin: "0 auto 16px" }}>
          <Icon name="alert" size={22} />
        </div>
        <p className="eyebrow">Locked</p>
        <h1 className="page-title">Order #{existing.id} can no longer be edited</h1>
        <p className="page-sub" style={{ margin: "0 auto 20px" }}>
          Once a delivery has been picked up, its details are locked. You can still cancel it from the order page if needed.
        </p>
        <Link to={`/business/orders/${existing.id}`} className="btn btn-amber">
          View order
        </Link>
      </div>
    );
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Picking a registered customer links the order to their account (so it shows
  // up under "My orders" for them) and conveniently fills in their name. A
  // walk-in customer with no account can still be entered by hand.
  function handleCustomerAccountChange(value) {
    const account = customerAccounts.find((c) => c.id === value);
    setForm((prev) => ({
      ...prev,
      customerId: value,
      customerName: account ? account.name : prev.customerName,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.pickup || !form.delivery) {
      setError("Please fill in customer, pickup, and delivery details.");
      return;
    }

    const payload = { ...form, customerId: form.customerId || null };

    runSubmit(() => {
      if (isEdit) {
        const result = editOrderDetails(existing.id, payload);
        if (!result.ok) {
          setError(result.reason);
          return;
        }
        showToast(`Order ${existing.id} updated.`);
        navigate(`/business/orders/${existing.id}`);
      } else {
        const created = createOrder(payload, user.id);
        showToast(`Order ${created.id} created.`);
        navigate(`/business/orders/${created.id}`);
      }
    });
  }

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <p className="eyebrow">{isEdit ? `Editing order #${existing.id}` : "New order"}</p>
        <h1 className="page-title">{isEdit ? "Edit order" : "Create order"}</h1>
        <p className="page-sub">
          {isEdit
            ? "Update the customer, route, or package details for this order."
            : "Fill in the delivery details. You can assign a rider after it's created."}
        </p>
      </div>

      <form className="panel form form-panel" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field field-span2">
            <span className="field-label">Customer account</span>
            <select className="field-input" value={form.customerId} onChange={(e) => handleCustomerAccountChange(e.target.value)}>
              <option value="">Walk-in customer — no Waypoint account</option>
              {customerAccounts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.email}
                </option>
              ))}
            </select>
            {form.customerId && (
              <span className="field-hint">This order will appear under "My orders" for this customer.</span>
            )}
          </label>

          <label className="field">
            <span className="field-label">Customer name</span>
            <input className="field-input" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} placeholder="e.g. Ali Khan" required />
          </label>

          <label className="field">
            <span className="field-label">Customer phone</span>
            <input className="field-input" value={form.customerPhone} onChange={(e) => update("customerPhone", e.target.value)} placeholder="+92 3xx xxxxxxx" required />
          </label>

          <label className="field">
            <span className="field-label">Pickup address</span>
            <input className="field-input" value={form.pickup} onChange={(e) => update("pickup", e.target.value)} placeholder="e.g. Mardan" required />
          </label>

          <label className="field">
            <span className="field-label">Delivery address</span>
            <input className="field-input" value={form.delivery} onChange={(e) => update("delivery", e.target.value)} placeholder="e.g. Timergara" required />
          </label>

          <label className="field field-span2">
            <span className="field-label">Package details</span>
            <input className="field-input" value={form.packageDetails} onChange={(e) => update("packageDetails", e.target.value)} placeholder="What's being delivered" />
          </label>

          <div className="field">
            <span className="field-label">Delivery priority</span>
            <div className="pill-select">
              {PRIORITIES.map((p) => (
                <button type="button" key={p} className={"pill-option" + (form.priority === p ? " active" : "")} onClick={() => update("priority", p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label">Payment method</span>
            <select className="field-input" value={form.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-subtle" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-amber" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size={14} />
                {isEdit ? "Saving…" : "Creating…"}
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create order"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
