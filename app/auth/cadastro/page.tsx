'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

type CadastroForm = {
  nome: string;
  email: string;
  senha: string;
};

type CadastroErros = Partial<Record<keyof CadastroForm, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM: CadastroForm = {
  nome: '',
  email: '',
  senha: '',
};

const validateCadastroForm = (form: CadastroForm): CadastroErros => {
  const erros: CadastroErros = {};

  if (!form.nome.trim()) {
    erros.nome = 'Informe seu nome.';
  }

  if (!form.email.trim()) {
    erros.email = 'Informe seu e-mail.';
  } else if (!EMAIL_REGEX.test(form.email)) {
    erros.email = 'Informe um e-mail válido.';
  }

  if (!form.senha.trim()) {
    erros.senha = 'Informe sua senha.';
  } else if (form.senha.trim().length < 6) {
    erros.senha = 'Senha deve ter pelo menos 6 caracteres.';
  }

  return erros;
};

export default function CadastroPage() {
  const [form, setForm] = useState<CadastroForm>(INITIAL_FORM);
  const [erros, setErros] = useState<CadastroErros>({});
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const isFormValido = useMemo(
    () => form.nome.trim() && form.email.trim() && form.senha.trim().length >= 6,
    [form]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');

    const novosErros = validateCadastroForm(form);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      return;
    }

    try {
      setEnviando(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const mensagem = data?.erro?.mensagem || data?.mensagem || 'Não foi possível realizar o cadastro.';
        setMensagemErro(mensagem);
        return;
      }

      setMensagemSucesso(data?.mensagem || 'Cadastro realizado com sucesso.');
      setForm(INITIAL_FORM);
      setErros({});
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setMensagemErro('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className={styles.page} aria-label="Página de cadastro">
      <div className={styles.card}>
        <h1 className={styles.title}>Criar conta</h1>
        <p className={styles.subtitle}>Preencha os dados abaixo para criar sua conta.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              value={form.nome}
              onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
              aria-invalid={Boolean(erros.nome)}
              placeholder="Digite seu nome"
            />
            {erros.nome && <span className={styles.error}>{erros.nome}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              aria-invalid={Boolean(erros.email)}
              placeholder="Digite seu e-mail"
            />
            {erros.email && <span className={styles.error}>{erros.email}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={form.senha}
              onChange={(event) => setForm((prev) => ({ ...prev, senha: event.target.value }))}
              aria-invalid={Boolean(erros.senha)}
              placeholder="Digite sua senha"
            />
            {erros.senha && <span className={styles.error}>{erros.senha}</span>}
          </div>

          <button className={styles.submit} type="submit" disabled={enviando || !isFormValido}>
            {enviando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        {mensagemErro && <p className={styles.error}>{mensagemErro}</p>}
        {mensagemSucesso && <p role="status">{mensagemSucesso}</p>}

        <p className={styles.loginHint}>
          Já tem conta?{' '}
          <Link href="/auth/login" className={styles.loginLink}>
            Entrar
          </Link>
        </p>
      </div>
    </section>
  );
}
