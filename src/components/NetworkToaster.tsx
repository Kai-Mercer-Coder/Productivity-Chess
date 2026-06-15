"use client";

import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NetworkToaster() {
  useEffect(() => {
    const onOffline = () => toast.error("Connection lost", { autoClose: false, toastId: "offline" });
    const onOnline = () => toast.dismiss("offline") ?? toast.success("Back online");

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return (
    <ToastContainer
      position="bottom-center"
      hideProgressBar
      newestOnTop
      theme="dark"
      toastClassName="!bg-neutral-900 !border !border-white/10 !rounded-xl !text-white !text-sm !font-semibold !shadow-2xl !px-5 !py-3"
    />
  );
}
