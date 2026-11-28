import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { IconFileTypePdf, IconPrinter, IconUpload } from "@tabler/icons-react";
import ModalBasic from "@components/ui/ModalBasic";
import StatusBadge from "@components/ui/StatusBadge";
import walletApi from "@store/api/wallet.api";
import { attachSignedVoucher, getSiteVoucher } from "@store/slices/wallet.slice";
import { formatInr, openPdfBlob } from "@utils/wallet.utils";

export default function VoucherDetailModal({
  isOpen,
  onClose,
  siteId,
  voucherId,
  canManage,
  onAttached,
}) {
  const dispatch = useDispatch();
  const { siteVoucherDetail, isLoadingVoucher, isSubmitting } = useSelector(
    (state) => state.wallet
  );
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen && siteId && voucherId) {
      dispatch(getSiteVoucher({ siteId, voucherId }));
    }
  }, [dispatch, isOpen, siteId, voucherId]);

  const voucher = siteVoucherDetail?.voucher || siteVoucherDetail || null;

  const handlePrint = async () => {
    try {
      const res = await walletApi.getSiteVoucherPrintHtmlApi({ siteId, voucherId });
      const win = window.open("", "_blank", "width=900,height=650");
      if (win) {
        win.document.write(res.data);
        win.document.close();
        win.focus();
      }
    } catch {
      toast.error("Failed to open printable voucher");
    }
  };

  const handleUploadSigned = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "OTHER");
      formData.append(
        "title",
        `CV-${String(voucher?.voucherNo || "").padStart(6, "0")} signed copy`
      );
      const upRes = await walletApi.uploadSiteDocumentApi({ siteId, formData });
      const documentId = upRes?.data?.documentId || upRes?.data?.id;
      if (!documentId) {
        toast.error("Upload succeeded but documentId missing");
        return;
      }
      await dispatch(
        attachSignedVoucher({
          siteId,
          voucherId,
          values: { documentId },
        })
      ).unwrap();
      toast.success("Signed voucher attached");
      dispatch(getSiteVoucher({ siteId, voucherId }));
      onAttached?.();
    } catch (err) {
      toast.error(err?.message || "Failed to attach signed voucher");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ModalBasic
      id="voucher-detail-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={
        voucher?.voucherNo
          ? `Cash Voucher CV-${String(voucher.voucherNo).padStart(6, "0")}`
          : "Cash Voucher"
      }
      size="lg"
    >
      <div className="p-6 space-y-4">
        {isLoadingVoucher ? (
          <div className="py-10 text-center text-sm text-slate-400">
            Loading cash voucher...
          </div>
        ) : !voucher ? (
          <div className="py-10 text-center text-sm text-slate-400">
            Voucher not found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 p-3">
                <span className="text-slate-400 block">Date</span>
                <span className="font-semibold text-slate-800 dark:text-white tabular-nums">
                  {voucher.date || "—"}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 p-3">
                <span className="text-slate-400 block">Paid To</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {voucher.paidTo || "—"}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 p-3">
                <span className="text-slate-400 block">Total</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatInr(siteVoucherDetail?.total ?? voucher.total)}
                </span>
              </div>
            </div>

            {siteVoucherDetail?.amountInWords && (
              <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                {siteVoucherDetail.amountInWords}
              </div>
            )}

            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Code</th>
                    <th className="px-3 py-2 text-left">Account Head</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {(voucher.lines || []).map((l, i) => (
                    <tr key={l.id || i}>
                      <td className="px-3 py-2 font-mono">{l.accountCode}</td>
                      <td className="px-3 py-2">{l.accountHeadName}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">
                        {formatInr(l.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                {voucher.signedDocumentId ? (
                  <StatusBadge label="Signed Voucher Attached" tone="emerald" size="sm" />
                ) : (
                  <StatusBadge label="Unsigned" tone="amber" size="sm" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await walletApi.getSiteVoucherPdfApi({
                        siteId,
                        voucherId,
                      });
                      openPdfBlob(res.data);
                    } catch {
                      toast.error("Failed to download voucher PDF");
                    }
                  }}
                  className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
                >
                  <IconFileTypePdf size={15} className="text-rose-500" />
                  <span>PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
                >
                  <IconPrinter size={15} />
                  <span>Print A5</span>
                </button>

                {canManage && !voucher.signedDocumentId && (
                  <label className="btn btn-primary btn-sm inline-flex items-center gap-1.5 cursor-pointer">
                    <IconUpload size={15} />
                    <span>{uploading || isSubmitting ? "Uploading..." : "Attach Signed Copy"}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,image/*"
                      disabled={uploading || isSubmitting}
                      onChange={handleUploadSigned}
                    />
                  </label>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ModalBasic>
  );
}
