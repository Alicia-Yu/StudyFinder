import { useState, useRef, useEffect } from 'react';

export default function GeminiChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            ...messages.map(msg => ({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (data.error) {
        setMessages(prev => [...prev, { role: 'bot', text: `Error: ${data.error.message}` }]);
      } else if (data.choices && data.choices[0]) {
        const botMessage = data.choices[0].message.content;
        setMessages(prev => [...prev, { role: 'assistant', text: botMessage }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, connection error.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: isOpen ? '400px' : '60px',
      height: isOpen ? '500px' : '60px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      {isOpen ? (
        <>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '12px 12px 0 0'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>AI Chat</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>×</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '10px 14px', borderRadius: '12px', backgroundColor: msg.role === 'user' ? '#3B82F6' : '#e0e0e0', color: msg.role === 'user' ? '#fff' : '#333', fontSize: '14px', wordWrap: 'break-word' }}>
                {msg.text}
              </div>
            ))}
            {loading && <div style={{ color: '#999', fontSize: '12px' }}>Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." disabled={loading} style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }} />
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 500, opacity: loading ? 0.6 : 1 }}>Send</button>
          </form>
        </>
      ) : (
        <button onClick={() => setIsOpen(true)} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', backgroundColor: '#3B82F6', color: 'white', fontSize: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</button>
      )}
    </div>
  );
}