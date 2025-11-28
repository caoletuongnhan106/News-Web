import ROUTES from "./routes/routes";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // thêm toast
import { useState } from "react"; // thêm state
import "../src/assets/sass/__main.scss";

const App = () => {
  const [ketQua, setKetQua] = useState('');

  const phanLoaiMauThuan = async () => {
    try {
      const res = await fetch('YOUR_API_URL/classify-conflict', { // thay URL API bạn
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Tin tức test mâu thuẫn chính trị Việt Nam' })
      });
      const data = await res.json();
      setKetQua(data.result || data.category || 'OK');
      toast.success('API gọi thành công!');
    } catch (error) {
      setKetQua('Lỗi: ' + error.message);
      toast.error('API lỗi!');
    }
  };

  return (
    <div>
      <>
        <Router>
          <ROUTES />
        </Router>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          limit={5}
        />
        {/* Test API button */}
        <div style={{position: 'fixed', top: 10, right: 10, background: 'white', padding: 10, border: '1px solid gray'}}>
          <button onClick={phanLoaiMauThuan}>Test Phân loại Mâu Thuẫn</button>
          <p>Kết quả: {ketQua}</p>
        </div>
      </>
    </div>
  );
};

export default App;
