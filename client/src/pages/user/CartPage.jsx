import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../app/api.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input, Select } from "../../components/ui/Input.jsx";
import { useCart } from "../../app/cart/CartProvider.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const cart = useCart();
  const toast = useToast();
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [addressId, setAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [addr, setAddr] = useState({ label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", lat: 12.9716, lng: 77.5946 });
  const [addingAddr, setAddingAddr] = useState(false);

  async function loadMe() {
    const { data } = await api.get("/api/users/me");
    setMe(data.user);
    setPaymentMethod(data.user?.defaultPaymentMethod || "UPI");
    const first = data.user?.addresses?.[0]?._id || "";
    setAddressId(first);
  }

  useEffect(() => { loadMe(); }, []);

  const subtotal = cart.subtotal();
  const deliveryFee = subtotal >= 499 ? 0 : 25;
  const total = subtotal + deliveryFee;

  const canCheckout = useMemo(() => cart.items.length > 0 && (addressId || (me?.addresses?.length || 0) > 0), [cart.items.length, addressId, me]);

  async function addAddress() {
    setAddingAddr(true);
    try {
      const { data } = await api.post("/api/users/me/addresses", addr);
      const user = { ...me, addresses: data.addresses };
      setMe(user);
      setAddressId(data.addresses?.[data.addresses.length-1]?._id || "");
      toast.push("Address added", "success");
      setAddr({ label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", lat: 12.9716, lng: 77.5946 });
    } catch (e) {
      toast.push(e?.response?.data?.message || "Failed to add address", "error");
    } finally {
      setAddingAddr(false);
    }
  }

  async function checkout() {
    if (!canCheckout) return toast.push("Add an address to checkout", "error");
    try {
      const payload = {
        items: cart.items.map(i => ({ medicineId: i.medicineId, qty: i.qty })),
        addressId,
        paymentMethod,
        mockPaid: true,
      };
      const { data } = await api.post("/api/orders", payload);
      cart.clear();
      toast.push("Order placed!", "success");
      nav(`/orders/${data.order._id}`);
    } catch (e) {
      toast.push(e?.response?.data?.message || "Checkout failed", "error");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">Cart</div>
        <div className="text-2xl font-extrabold">Checkout</div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="text-sm font-semibold">Items</div>
          <div className="mt-4 space-y-3">
            {cart.items.length === 0 && <div className="text-sm text-slate-600">Your cart is empty.</div>}
            {cart.items.map((i) => (
              <div key={i.medicineId} className="rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{i.name}</div>
                  <div className="text-xs text-slate-500">₹{i.price} each</div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-24"
                    min={1}
                    value={i.qty}
                    onChange={(e) => cart.setQty(i.medicineId, Number(e.target.value))}
                  />
                  <Button variant="ghost" onClick={() => cart.remove(i.medicineId)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-sm font-semibold">Delivery address</div>
            <div className="mt-3 space-y-3">
              <Select value={addressId} onChange={(e) => setAddressId(e.target.value)}>
                {(me?.addresses || []).map(a => (
                  <option key={a._id} value={a._id}>{a.label}: {a.city} {a.pincode}</option>
                ))}
              </Select>

              <details className="rounded-2xl border border-slate-100 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">Add new address</summary>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Input placeholder="Label" value={addr.label} onChange={(e) => setAddr(s => ({ ...s, label: e.target.value }))} />
                  <Input placeholder="Pincode" value={addr.pincode} onChange={(e) => setAddr(s => ({ ...s, pincode: e.target.value }))} />
                  <div className="col-span-2">
                    <Input placeholder="Address line 1" value={addr.line1} onChange={(e) => setAddr(s => ({ ...s, line1: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <Input placeholder="Address line 2" value={addr.line2} onChange={(e) => setAddr(s => ({ ...s, line2: e.target.value }))} />
                  </div>
                  <Input placeholder="City" value={addr.city} onChange={(e) => setAddr(s => ({ ...s, city: e.target.value }))} />
                  <Input placeholder="State" value={addr.state} onChange={(e) => setAddr(s => ({ ...s, state: e.target.value }))} />
                </div>
                <Button className="mt-3" variant="soft" onClick={addAddress} disabled={addingAddr}>
                  {addingAddr ? "Adding…" : "Add address"}
                </Button>
              </details>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold">Payment</div>
            <div className="mt-3">
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
              </Select>
              <div className="mt-3 text-xs text-slate-500">
                Demo checkout: payment is marked as paid automatically.
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between mt-2"><span>Delivery</span><span>₹{deliveryFee}</span></div>
              <div className="flex justify-between mt-2 font-extrabold"><span>Total</span><span>₹{total}</span></div>
            </div>

            <Button className="mt-4 w-full" disabled={!canCheckout} onClick={checkout}>
              Place order
            </Button>
            <Button className="mt-2 w-full" variant="ghost" onClick={() => nav("/pharmacy")}>
              Continue shopping
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
