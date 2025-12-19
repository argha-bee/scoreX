"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";

export default function Alert({ success, error }) {
  useEffect(() => {
    if (error) {
      Swal.fire({ icon: "error", title: "Oops...", text: error });
    } else if (success) {
      Swal.fire({ icon: "success", title: "Success!", text: success });
    }
  }, [error, success]);

  return null;
}
