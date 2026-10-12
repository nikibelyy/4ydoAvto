import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Application rendering error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ maxWidth: 520, margin: '12vh auto', padding: 24, fontFamily: 'system-ui', textAlign: 'center' }}>
          <h1>Что-то пошло не так</h1>
          <p>Попробуйте перезагрузить приложение. Ваш график хранится на этом устройстве.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 18px', borderRadius: 12, border: 0, background: '#315efb', color: '#fff' }}>
            Перезагрузить
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
