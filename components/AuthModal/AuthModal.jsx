'use client';

import { useState } from 'react';
import styles from './AuthModal.module.css';

const AuthModal = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro(null);
    setEnviando(true);
    const result = await onSubmit(email, senha);
    setEnviando(false);

    if (!result.ok) {
      setErro(result.mensagem);
    } else {
      setEmail('');
      setSenha('');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Login"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar login">
          x
        </button>
        <h2 className={styles.title}>Entrar</h2>
        <p className={styles.subtitle}>Entre para continuar sua acao.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            E-mail
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className={styles.label}>
            Senha
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />
          </label>
          {erro && <p className={styles.error}>{erro}</p>}
          <button type="submit" className={styles.submit} disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
