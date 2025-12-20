import { useEffect, useState } from "react";

const PrintBill = () => {
  const [bill, setBill] = useState("");

  useEffect(() => {
    const data = sessionStorage.getItem("PRINT_BILL");
    setBill(data || "");
  }, []);

  return (
    <div style={styles.page}>
      <button onClick={() => window.print()} style={styles.btn}>
        🖨 Print Bill
      </button>

      <pre style={styles.bill}>{bill}</pre>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: "monospace",
    width: "58mm",
    padding: "8px",
  },
  bill: {
    whiteSpace: "pre-wrap",
    fontSize: "12px",
  },
  btn: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
  },
};

export default PrintBill;
