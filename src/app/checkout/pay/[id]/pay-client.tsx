"use client";

import { useEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/components/material-icon";

type Method = "choose" | "promptpay" | "card";

declare global {
  interface Window {
    Omise?: {
      setPublicKey: (key: string) => void;
      createToken: (
        type: "card",
        card: { name: string; number: string; expiration_month: string; expiration_year: string; security_code: string },
        handler: (statusCode: number, response: { id?: string; message?: string }) => void,
      ) => void;
    };
  }
}

/** V1.5: หน้าชำระเงินจริงผ่าน Opn/Omise — PromptPay QR + บัตร (tokenization ที่ client) */
export function PayClient({
  paymentId,
  amount,
  omisePublicKey,
}: {
  paymentId: string;
  amount: number;
  omisePublicKey: string;
}) {
  const [method, setMethod] = useState<Method>("choose");
  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState<"PENDING" | "PAID" | "FAILED">("PENDING");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const omiseLoaded = useRef(false);

  // โหลด Omise.js สำหรับ tokenization บัตร
  useEffect(() => {
    if (method !== "card" || omiseLoaded.current || !omisePublicKey) return;
    const script = document.createElement("script");
    script.src = "https://cdn.omise.co/omise.js";
    script.onload = () => {
      window.Omise?.setPublicKey(omisePublicKey);
      omiseLoaded.current = true;
    };
    document.head.appendChild(script);
  }, [method, omisePublicKey]);

  // Poll status ตอนรอ PromptPay
  useEffect(() => {
    if (method !== "promptpay" || status === "PAID") return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/payments/${paymentId}`);
      const data = await res.json();
      if (data.status === "PAID") {
        setStatus("PAID");
        window.location.href = `/orders?paid=${data.orderId}`;
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [method, paymentId, status]);

  async function startPromptPay() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "promptpay" }),
      });
      const data = await res.json();
      if (data.qrImage) {
        setQr(data.qrImage);
        setMethod("promptpay");
      } else {
        setError("สร้าง QR ไม่สำเร็จ กรุณาลองใหม่");
      }
    } finally {
      setBusy(false);
    }
  }

  async function payWithCard(form: HTMLFormElement) {
    setBusy(true);
    setError(null);
    const fd = new FormData(form);
    try {
      if (!window.Omise) throw new Error("omise_js");
      window.Omise.createToken(
        "card",
        {
          name: String(fd.get("cardName") ?? ""),
          number: String(fd.get("cardNumber") ?? "").replace(/\s/g, ""),
          expiration_month: String(fd.get("expMonth") ?? ""),
          expiration_year: String(fd.get("expYear") ?? ""),
          security_code: String(fd.get("cvv") ?? ""),
        },
        async (statusCode, response) => {
          if (!response.id) {
            setBusy(false);
            setError(response.message ?? "บัตรไม่ถูกต้อง");
            return;
          }
          const res = await fetch(`/api/payments/${paymentId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ method: "card", token: response.id }),
          });
          const data = await res.json();
          if (data.status === "PAID") {
            window.location.href = `/orders?paid=${data.orderId}`;
          } else {
            setBusy(false);
            setError("ชำระเงินไม่สำเร็จ กรุณาลองบัตรอื่น");
          }
        },
      );
    } catch {
      setBusy(false);
      setError("โหลดระบบบัตรไม่สำเร็จ รีเฟรชหน้าแล้วลองใหม่");
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {method === "choose" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            className="border-2 border-primary text-primary rounded-xl p-5 text-center hover:bg-primary-50 transition-colors font-headline font-bold"
            disabled={busy}
            onClick={() => void startPromptPay()}
            type="button"
          >
            <MaterialIcon name="qr_code_2" className="text-3xl mx-auto mb-1" />
            PromptPay
            <span className="block text-xs font-body font-normal text-text-muted mt-1">สแกนจ่ายทันที</span>
          </button>
          <button
            className="border-2 border-primary text-primary rounded-xl p-5 text-center hover:bg-primary-50 transition-colors font-headline font-bold"
            onClick={() => setMethod("card")}
            type="button"
          >
            <MaterialIcon name="credit_card" className="text-3xl mx-auto mb-1" />
            บัตรเครดิต/เดบิต
            <span className="block text-xs font-body font-normal text-text-muted mt-1">Visa · Mastercard · JCB</span>
          </button>
        </div>
      )}

      {method === "promptpay" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <p className="text-sm font-medium mb-3">สแกน QR ด้วยแอปธนาคาร</p>
          {qr ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="PromptPay QR" className="mx-auto w-56 h-56 border border-gray-100 rounded-lg" src={qr} />
              <p className="mt-3 text-xs text-text-muted">
                ยอด ฿{amount.toLocaleString()} · ระบบตรวจสอบการชำระอัตโนมัติ อย่าปิดหน้านี้
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-primary text-sm">
                <span className="animate-pulse">●</span> รอการชำระเงิน...
              </div>
            </>
          ) : (
            <p className="text-sm text-text-muted">กำลังสร้าง QR...</p>
          )}
        </div>
      )}

      {method === "card" && (
        <form
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void payWithCard(e.currentTarget);
          }}
        >
          <input className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" name="cardName" placeholder="ชื่อบนบัตร" required type="text" />
          <input
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
            name="cardNumber"
            placeholder="หมายเลขบัตร"
            required
            type="text"
          />
          <div className="grid grid-cols-3 gap-3">
            <input className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm" name="expMonth" placeholder="MM" required type="text" />
            <input className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm" name="expYear" placeholder="YYYY" required type="text" />
            <input className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm" name="cvv" placeholder="CVV" required type="text" />
          </div>
          <button
            className="w-full bg-primary hover:bg-primary-dark text-white font-headline font-bold text-lg py-4 rounded-xl transition-colors shadow-md disabled:opacity-60"
            disabled={busy}
            type="submit"
          >
            {busy ? "กำลังตัดบัตร..." : `ชำระ ฿${amount.toLocaleString()}`}
          </button>
        </form>
      )}
    </div>
  );
}
