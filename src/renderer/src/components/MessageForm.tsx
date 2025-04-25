import React, { useState } from 'react';

// import './MessageForm.css'; // 导入 CSS 文件

// 定义表单数据的类型
interface FormData {
  nickname: string;
  message: string;
  exePath: string;
}



// // 创建一个新窗口
// const win = new BrowserWindow({ width: 800, height: 600 });

// // 最小化窗口
// win.minimize();

// // 最大化窗口
// win.maximize();

// // 恢复窗口
// win.restore();

const MessageForm: React.FC = () => {
  // 使用泛型为 useState 提供类型
  const [formData, setFormData] = useState<FormData>({
    nickname: '',
    message: '',
    exePath: 'D:\\soft\\WeChat\\WeChat.exe', // 使用双反斜杠转义路径
  });

  // 用于控制提示窗口的显示状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理表单字段的输入
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // 提交表单时的处理函数
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // 阻止表单默认提交行为

    setIsSubmitting(true); // 显示提示窗口
    window.electron.ipcRenderer.send('window-min');
    
    try {
      // 发起 POST 请求
      const response = await fetch('http://127.0.0.1:5001/sendMsg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result)
        // alert(`消息已发送成功！${JSON.stringify(result)}`);
      } else {
        // alert('消息发送失败，请稍后再试！');
      }
    } catch (error) {
      console.error('请求失败:', error);
      // alert('消息发送失败，请检查网络或联系管理员！');
    } finally {
      setIsSubmitting(false); // 隐藏提示窗口
      window.electron.ipcRenderer.send('window-restore'); 
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>昵称：</label>
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>消息内容：</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', height: '100px' }}
          ></textarea>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>程序路径：</label>
          <textarea
            name="exePath"
            value={formData.exePath}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', height: '100px' }}
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          提交
        </button>
      </form>

      {isSubmitting && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <p>机器人操控中...</p>
          </div>
        </div>
      )}
    </div>
  );

};

export default MessageForm;